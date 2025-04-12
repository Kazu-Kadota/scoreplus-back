import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { S3Client } from '@aws-sdk/client-s3'

import { CompanyRequestPersonConfigEnum } from '~/models/dynamo/enums/company'
import { PersonStateEnum } from '~/models/dynamo/enums/request'
import { UserGroupEnum } from '~/models/dynamo/enums/user'
import { PersonAnalysisOptionsRequest, PersonAnalysisOptionsRequestValueAnswer } from '~/models/dynamo/requestplus/analysis-person/person-analysis-options'
import { RequestplusAnalysisPerson, RequestplusAnalysisPersonKey } from '~/models/dynamo/requestplus/analysis-person/table'
import { RequestplusFinishedAnalysisPerson } from '~/models/dynamo/requestplus/finished-analysis-person/table'
import { RequestplusValidateAnalysisPerson } from '~/models/dynamo/requestplus/validate-analysis-person/table'
import { PersonAnalysisInformationValidation } from '~/models/dynamo/requestplus/validate-analysis-person/validation-information'
import getRequestplusAnalysisPerson from '~/services/aws/dynamo/request/analysis/person/get'
import getRequestplusFinishedAnalysisPerson from '~/services/aws/dynamo/request/finished/person/get'
import getRequestplusValidateAnalysisPerson from '~/services/aws/dynamo/request/validate/person/get'
import { s3ThirdPartyGetParamsResponseType } from '~/services/aws/s3/third-party/answer/person/get'
import ForbiddenError from '~/utils/errors/403-forbidden'
import NotFoundError from '~/utils/errors/404-not-found'
import { UserFromJwt } from '~/utils/extract-jwt-lambda'
import logger from '~/utils/logger'
import { Exact } from '~/utils/types/exact'

import countConsult from './count-consult'
import informationValidationMap from './information-validation-map'
import personAnalysisOptionMap from './person-analysis-option-map'

export type GetRequestPersonAdapterParams = {
  dynamodbClient: DynamoDBClient
  person_id: string
  request_id: string
  user_info: UserFromJwt
  s3Client: S3Client
}

export type GetRequestPersonAdapterResponseRequestedPerson = Omit<RequestplusAnalysisPerson,
  | 'third_party'
>

export type GetRequestPersonAdapterResponseValidatePerson = Omit<RequestplusValidateAnalysisPerson,
  | 'third_party'
>

export type GetRequestPersonAdapterResponseFinishedPerson = Omit<RequestplusFinishedAnalysisPerson,
| 'third_party'
| 'already_consulted'
>

export type GetRequestPersonAdapterResponse = GetRequestPersonAdapterResponseFinishedPerson | GetRequestPersonAdapterResponseValidatePerson | GetRequestPersonAdapterResponseRequestedPerson

const getRequestPersonAdapter = async ({
  dynamodbClient,
  person_id,
  request_id,
  user_info,
  s3Client,
}:GetRequestPersonAdapterParams): Promise<GetRequestPersonAdapterResponse> => {
  const key: RequestplusAnalysisPersonKey = {
    request_id,
    person_id,
  }
  const request_person = await getRequestplusAnalysisPerson(key, dynamodbClient)

  if (request_person) {
    const is_client_request = user_info.user_type === UserGroupEnum.CLIENT
    if (is_client_request) {
      if (user_info.company_name !== request_person.company_name) {
        logger.warn({
          message: 'Person in analysis',
          company_name: user_info,
          request_id: key.request_id,
          person_id: key.person_id,
        })

        throw new ForbiddenError('Pessoa em análise')
      }

      // Only Ethical and Historical is forbidden to client see from third party responses
      for (const key of Object.keys(request_person.person_analysis_options)) {
        const company_request_person = key as CompanyRequestPersonConfigEnum
        if (company_request_person === CompanyRequestPersonConfigEnum.HISTORY) {
          const regions = request_person.person_analysis_options[company_request_person]?.regions.map((region): (Partial<PersonAnalysisOptionsRequestValueAnswer> & {
            region: PersonStateEnum
          }) => {
            return {
              ...region,
              reason: undefined,
            }
          }) ?? []

          request_person.person_analysis_options[company_request_person] = {
            ...request_person.person_analysis_options[company_request_person],
            regions,
          }
        } else if (company_request_person === CompanyRequestPersonConfigEnum.ETHICAL) {
          delete request_person.person_analysis_options[company_request_person]?.reason
        }
      }

      const person_analysis_options_map = await Promise.all(Object
        .entries(request_person.person_analysis_options)
        .map(([key, value]) => personAnalysisOptionMap({
          key,
          value,
          person_id,
          request_id,
          response_type: s3ThirdPartyGetParamsResponseType.answer,
          s3Client,
        },
        )))

      const person_analysis_options = person_analysis_options_map.reduce((prev, curr) => ({
        ...prev,
        ...curr,
      }), {} as any) as Partial<PersonAnalysisOptionsRequest<false>>

      request_person.person_analysis_options = person_analysis_options

      const {
        third_party,
        ...client_person_info
      } = request_person

      const person: Exact<GetRequestPersonAdapterResponseRequestedPerson, typeof client_person_info> = client_person_info

      return person
    }

    const person_analysis_options_map = await Promise.all(Object
      .entries(request_person.person_analysis_options)
      .map(([key, value]) => personAnalysisOptionMap({
        key,
        value,
        person_id,
        request_id,
        response_type: s3ThirdPartyGetParamsResponseType.answer,
        s3Client,
      },
      )))

    const person_analysis_options = person_analysis_options_map.reduce((prev, curr) => ({
      ...prev,
      ...curr,
    }), {} as any) as Partial<PersonAnalysisOptionsRequest<false>>

    request_person.person_analysis_options = person_analysis_options

    return request_person
  }

  const validate_request_person = await getRequestplusValidateAnalysisPerson(key, dynamodbClient)

  if (validate_request_person) {
    const is_client_request = user_info.user_type === UserGroupEnum.CLIENT
    if (is_client_request) {
      if (user_info.company_name !== validate_request_person.company_name) {
        logger.warn({
          message: 'Person in analysis',
          company_name: user_info,
          request_id: key.request_id,
          person_id: key.person_id,
        })

        throw new ForbiddenError('Pessoa em análise')
      }

      // Only Ethical and Historical is forbidden to client see from third party responses
      for (const key of Object.keys(validate_request_person.person_analysis_options)) {
        const company_request_person = key as CompanyRequestPersonConfigEnum
        if (company_request_person === CompanyRequestPersonConfigEnum.HISTORY) {
          const regions = validate_request_person.person_analysis_options[company_request_person]?.regions.map((region): (PersonAnalysisOptionsRequestValueAnswer & {
            region: PersonStateEnum
          }) => {
            return {
              ...region,
              reason: undefined,
            }
          }) ?? []

          validate_request_person.person_analysis_options[company_request_person] = {
            ...validate_request_person.person_analysis_options[company_request_person],
            regions,
          }
        } else if (company_request_person === CompanyRequestPersonConfigEnum.ETHICAL) {
          delete validate_request_person.person_analysis_options[company_request_person]?.reason
        }
      }

      const person_analysis_options_map = await Promise.all(Object
        .entries(validate_request_person.person_analysis_options)
        .map(([key, value]) => personAnalysisOptionMap({
          key,
          value,
          person_id,
          request_id,
          response_type: s3ThirdPartyGetParamsResponseType.answer,
          s3Client,
        },
        )))

      const person_analysis_options = person_analysis_options_map.reduce((prev, curr) => ({
        ...prev,
        ...curr,
      }), {} as any) as Partial<PersonAnalysisOptionsRequest<true>>

      validate_request_person.person_analysis_options = person_analysis_options

      // Only Ethical is forbidden to client see from validation
      for (const key of Object.keys(validate_request_person.information_validation)) {
        const company_request_person = key as CompanyRequestPersonConfigEnum
        if (company_request_person === CompanyRequestPersonConfigEnum.ETHICAL) {
          delete validate_request_person.information_validation[company_request_person]?.reason
        }
      }

      const information_validation_map = await Promise.all(Object
        .entries(validate_request_person.information_validation)
        .map(([key, value]) => informationValidationMap({
          key,
          value,
          person_id,
          request_id,
          response_type: s3ThirdPartyGetParamsResponseType.validate,
          s3Client,
        },
        )))

      const information_validation = information_validation_map.reduce((prev, curr) => ({
        ...prev,
        ...curr,
      }), {} as any) as Partial<PersonAnalysisInformationValidation<false>>

      validate_request_person.information_validation = information_validation

      const {
        third_party,
        ...client_person_info
      } = validate_request_person

      const person: Exact<GetRequestPersonAdapterResponseValidatePerson, typeof client_person_info> = client_person_info

      return person
    }

    const person_analysis_options_map = await Promise.all(Object
      .entries(validate_request_person.person_analysis_options)
      .map(([key, value]) => personAnalysisOptionMap({
        key,
        value,
        person_id,
        request_id,
        response_type: s3ThirdPartyGetParamsResponseType.answer,
        s3Client,
      },
      )))

    const person_analysis_options = person_analysis_options_map.reduce((prev, curr) => ({
      ...prev,
      ...curr,
    }), {} as any) as Partial<PersonAnalysisOptionsRequest<true>>

    validate_request_person.person_analysis_options = person_analysis_options

    const information_validation_map = await Promise.all(Object
      .entries(validate_request_person.information_validation)
      .map(([key, value]) => informationValidationMap({
        key,
        value,
        person_id,
        request_id,
        response_type: s3ThirdPartyGetParamsResponseType.validate,
        s3Client,
      },
      )))

    const information_validation = information_validation_map.reduce((prev, curr) => ({
      ...prev,
      ...curr,
    }), {} as any) as Partial<PersonAnalysisInformationValidation<false>>

    validate_request_person.information_validation = information_validation

    return validate_request_person
  }

  const finished_person = await getRequestplusFinishedAnalysisPerson(key, dynamodbClient)

  if (finished_person) {
    const is_client_request = user_info.user_type === UserGroupEnum.CLIENT
    if (is_client_request) {
      // Only Ethical and Historical is forbidden to client see from third party responses
      for (const key of Object.keys(finished_person.person_analysis_options)) {
        const company_request_person = key as CompanyRequestPersonConfigEnum
        if (company_request_person === CompanyRequestPersonConfigEnum.HISTORY) {
          const regions = finished_person.person_analysis_options[company_request_person]?.regions.map((region): (PersonAnalysisOptionsRequestValueAnswer & {
            region: PersonStateEnum
          }) => {
            return {
              ...region,
              reason: undefined,
            }
          }) ?? []

          finished_person.person_analysis_options[company_request_person] = {
            ...finished_person.person_analysis_options[company_request_person],
            regions,
          }
        } else if (company_request_person === CompanyRequestPersonConfigEnum.ETHICAL) {
          delete finished_person.person_analysis_options[company_request_person]?.reason
        }
      }

      const person_analysis_options_map = await Promise.all(Object
        .entries(finished_person.person_analysis_options)
        .map(([key, value]) => personAnalysisOptionMap({
          key,
          value,
          person_id,
          request_id,
          response_type: s3ThirdPartyGetParamsResponseType.answer,
          s3Client,
        },
        )))

      const person_analysis_options = person_analysis_options_map.reduce((prev, curr) => ({
        ...prev,
        ...curr,
      }), {} as any) as Partial<PersonAnalysisOptionsRequest<true>>

      finished_person.person_analysis_options = person_analysis_options

      // Only Ethical is forbidden to client see from validation
      for (const key of Object.keys(finished_person.information_validation)) {
        const company_request_person = key as CompanyRequestPersonConfigEnum
        if (company_request_person === CompanyRequestPersonConfigEnum.ETHICAL) {
          delete finished_person.information_validation[company_request_person]?.reason
        }
      }

      const information_validation_map = await Promise.all(Object
        .entries(finished_person.information_validation)
        .map(([key, value]) => informationValidationMap({
          key,
          value,
          person_id,
          request_id,
          response_type: s3ThirdPartyGetParamsResponseType.validate,
          s3Client,
        },
        )))

      const information_validation = information_validation_map.reduce((prev, curr) => ({
        ...prev,
        ...curr,
      }), {} as any) as Partial<PersonAnalysisInformationValidation<true>>

      finished_person.information_validation = information_validation

      await countConsult({
        dynamodbClient,
        finished_person,
        user_info,
      })

      const {
        already_consulted,
        third_party,
        ...client_person_info
      } = finished_person

      const person: Exact<GetRequestPersonAdapterResponseFinishedPerson, typeof client_person_info> = client_person_info

      return person
    }

    const person_analysis_options_map = await Promise.all(Object
      .entries(finished_person.person_analysis_options)
      .map(([key, value]) => personAnalysisOptionMap({
        key,
        value,
        person_id,
        request_id,
        response_type: s3ThirdPartyGetParamsResponseType.answer,
        s3Client,
      },
      )))

    const person_analysis_options = person_analysis_options_map.reduce((prev, curr) => ({
      ...prev,
      ...curr,
    }), {} as any) as Partial<PersonAnalysisOptionsRequest<true>>

    finished_person.person_analysis_options = person_analysis_options

    const information_validation_map = await Promise.all(Object
      .entries(finished_person.information_validation)
      .map(([key, value]) => informationValidationMap({
        key,
        value,
        person_id,
        request_id,
        response_type: s3ThirdPartyGetParamsResponseType.validate,
        s3Client,
      },
      )))

    const information_validation = information_validation_map.reduce((prev, curr) => ({
      ...prev,
      ...curr,
    }), {} as any) as Partial<PersonAnalysisInformationValidation<true>>

    finished_person.information_validation = information_validation

    return finished_person
  }

  logger.warn({
    message: 'Person not exist',
    request_id: key.request_id,
    person_id: key.person_id,
  })

  throw new NotFoundError('Pessoa não existe')
}

export default getRequestPersonAdapter

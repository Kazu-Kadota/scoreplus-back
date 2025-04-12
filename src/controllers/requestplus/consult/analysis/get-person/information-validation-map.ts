import { S3Client } from '@aws-sdk/client-s3'

import { CompanyRequestPersonConfigEnum } from '~/models/dynamo/enums/company'
import { PersonAnalysisInformationValidation, PersonAnalysisInformationValidationHistory, PersonAnalysisInformationValidationHistoryRegion, PersonAnalysisInformationValidationValueDefault } from '~/models/dynamo/requestplus/validate-analysis-person/validation-information'
import { S3ThirdPartyAnswerPersonGetResponseType } from '~/services/aws/s3/third-party/answer/person/get'

import getS3AnalysisInfoAdapter, { GetS3AnalysisInfoAdapterParams } from './get-s3-analysis-info-adapter'

export type PersonAnalysisInformationValidationMapParams = {
  key: string
  value: any
  person_id: string
  request_id: string
  response_type: S3ThirdPartyAnswerPersonGetResponseType
  s3Client: S3Client
}

type PersonAnalysisInformationValidationValuesHistoryRegion = PersonAnalysisInformationValidationHistoryRegion<true>
  | PersonAnalysisInformationValidationHistoryRegion<false>

type PersonAnalysisInformationValidationValuesHistory = PersonAnalysisInformationValidationHistory<true>
  | PersonAnalysisInformationValidationHistory<false>

type PersonAnalysisInformationValidationValuesDefault = PersonAnalysisInformationValidationValueDefault<true>
| PersonAnalysisInformationValidationValueDefault<false>

const informationValidationMap = async ({
  key,
  value,
  person_id,
  request_id,
  response_type,
  s3Client,
}: PersonAnalysisInformationValidationMapParams): Promise<Partial<PersonAnalysisInformationValidation<true>> | Partial<PersonAnalysisInformationValidation<false>>> => {
  const company_request_person = key as CompanyRequestPersonConfigEnum

  if (company_request_person === CompanyRequestPersonConfigEnum.HISTORY) {
    const regions: PersonAnalysisInformationValidationValuesHistoryRegion[] = [] as PersonAnalysisInformationValidationValuesHistoryRegion[]

    for (const region of (value as PersonAnalysisInformationValidationValuesHistory).regions) {
      if (!region.reason) {
        continue
      }

      const get_s3_analysis_info_params: GetS3AnalysisInfoAdapterParams = {
        company_request_person,
        person_id,
        region: region.region,
        request_id,
        response_type,
        s3_client: s3Client,
      }

      const analysis_info = await getS3AnalysisInfoAdapter(get_s3_analysis_info_params)

      regions.push({
        ...region,
        reason: analysis_info,
      })
    }

    return {
      [company_request_person]: {
        regions,
      },
    }
  }
  const content = value as PersonAnalysisInformationValidationValuesDefault

  if (!content.reason) {
    return {
      [company_request_person]: {
        ...content,
      },
    }
  }

  const get_s3_analysis_info_params: GetS3AnalysisInfoAdapterParams = {
    company_request_person,
    person_id,
    request_id,
    response_type,
    s3_client: s3Client,
  }

  const analysis_info = await getS3AnalysisInfoAdapter(get_s3_analysis_info_params)

  return {
    [company_request_person]: {
      ...content,
      reason: analysis_info,
    },
  }
}

// const personAnalysisOptionMap = ({
//   person_id,
//   request_id,
//   s3Client,
// }: PersonAnalysisOptionMapParams) =>
//   async ([key, value]: [string, any] )
//   : Promise<Partial<PersonAnalysisOptionsRequest<true>> | Partial<PersonAnalysisOptionsRequest<false>>> => {
//     const company_request_person = key as CompanyRequestPersonConfigEnum
//     const content = value as Partial<PersonAnalysisOptionsRequest<true>> | Partial<PersonAnalysisOptionsRequest<false>>]
//     if (company_request_person === CompanyRequestPersonConfigEnum.HISTORY) {
//       const regions: PersonAnalysisOptionsRequestValueHistory<true> | PersonAnalysisOptionsRequestValueHistory<false> = [] as unknown as PersonAnalysisOptionsRequestValueHistory<true> | PersonAnalysisOptionsRequestValueHistory<false>

//       for (const region of content[company_request_person].regions) {
//         if (!region.result) {
//           continue
//         }

//         const get_s3_analysis_info_params: GetS3AnalysisInfoAdapterParams = {
//           company_request_person,
//           person_id,
//           request_id,
//           s3_client: s3Client,
//         }

//         const analysis_info = await getS3AnalysisInfoAdapter(get_s3_analysis_info_params)
//       }
//     }

//     if (!content[company_request_person]) {
//       return {
//         [company_request_person]: {},
//       }
//     }

//     const get_s3_analysis_info_params: GetS3AnalysisInfoAdapterParams = {
//       company_request_person,
//       person_id,
//       request_id,
//       s3_client: s3Client,
//     }

//     const analysis_info = await getS3AnalysisInfoAdapter(get_s3_analysis_info_params)

//     return {
//       [company_request_person]: {
//         ...content,
//         analysis_info,
//       },
//     }
//   }

export default informationValidationMap

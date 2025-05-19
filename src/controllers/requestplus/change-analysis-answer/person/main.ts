import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { S3Client } from '@aws-sdk/client-s3'

import { thirdPartyCompanyRequestPersonConfigMap } from '~/constants/third-party-map'
import { CompanyRequestPersonConfigEnum } from '~/models/dynamo/enums/company'
import { PersonThirdPartyEnum } from '~/models/dynamo/enums/request'
import { PersonAnalysisOptionsRequest } from '~/models/dynamo/requestplus/analysis-person/person-analysis-options'
import { RequestplusFinishedAnalysisPersonKey } from '~/models/dynamo/requestplus/finished-analysis-person/table'
import { Controller } from '~/models/lambda'
import updateRequestplusFinishedRequestPerson from '~/services/aws/dynamo/request/finished/person/update'
import s3ThirdPartyAnswerPersonPut, { s3ThirdPartyPutParamsResponseType } from '~/services/aws/s3/third-party/answer/person/put'
import BadRequestError from '~/utils/errors/400-bad-request'
import logger from '~/utils/logger'

import getFinishedPersonAdapter from './get-finished-person-adapter'
import validateBodyPerson from './validate-body-person'

const dynamodbClient = new DynamoDBClient({
  region: 'us-east-1',
  maxAttempts: 5,
})

const s3Client = new S3Client({
  region: 'us-east-1',
  maxAttempts: 5,
})

const changeAnalysisAnswerPersonController: Controller<true> = async (req) => {
  const body = validateBodyPerson(JSON.parse(req.body as string))

  const type = body.type

  const person_key: RequestplusFinishedAnalysisPersonKey = {
    person_id: body.person_id,
    request_id: body.request_id,
  }

  const finished_person = await getFinishedPersonAdapter(person_key, dynamodbClient)

  const find_person_analysis_option_information = Object.keys(finished_person.person_analysis_options).find((value) => value === body.type)

  if (!find_person_analysis_option_information) {
    logger.warn({
      message: 'Analysis type does not exist in this analysis',
      ...person_key,
      type,
    })

    throw new BadRequestError('Tipo da análise não existe nessa análise')
  }

  let region_information

  if (type === CompanyRequestPersonConfigEnum.HISTORY) {
    const find_region_information = finished_person.person_analysis_options.history!.regions.find((value) => value.region === body.region)

    if (!find_region_information) {
      logger.warn({
        message: 'Region does not exist in this analysis',
        ...person_key,
        type,
        region: body.region,
      })

      throw new BadRequestError('Região não existe nessa análise')
    }

    region_information = find_region_information
  }

  const third_party = thirdPartyCompanyRequestPersonConfigMap[type].split('_person')[0] as PersonThirdPartyEnum

  await s3ThirdPartyAnswerPersonPut({
    analysis_type: finished_person.analysis_type,
    body: JSON.stringify(body.reason),
    company_request_person: type,
    person_id: finished_person.person_id,
    region: body.region,
    request_id: finished_person.request_id,
    s3_client: s3Client,
    response_type: s3ThirdPartyPutParamsResponseType.answer,
    third_party,
  })

  const now = new Date().toISOString()

  let person_analysis_options: Partial<PersonAnalysisOptionsRequest<true>>

  if (type === CompanyRequestPersonConfigEnum.HISTORY) {
    person_analysis_options = {
      ...finished_person.person_analysis_options,
      [type]: {
        regions: [
          ...finished_person.person_analysis_options[type]!.regions,
          {
            ...region_information!,
            updated_at: now,
          },
        ],
      },
    }
  } else {
    person_analysis_options = {
      ...finished_person.person_analysis_options,
      [type]: {
        ...finished_person.person_analysis_options[type],
        updated_at: now,
      },
    }
  }

  await updateRequestplusFinishedRequestPerson(
    person_key,
    {
      person_analysis_options,
    },
    dynamodbClient,
  )

  logger.info({
    message: 'Successfully requested to change analysis answer person',
    ...person_key,
    type,
    region: body.region,
  })

  return {
    body: {
      message: 'Successfully requested to change analysis answer person',
      ...person_key,
      type,
      region: body.region,
    },
  }
}

export default changeAnalysisAnswerPersonController

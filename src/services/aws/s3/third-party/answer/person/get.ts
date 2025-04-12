import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3'
import getStringEnv from 'src/utils/get-string-env'
import logger from 'src/utils/logger'

import { CompanyRequestPersonConfigEnum } from '~/models/dynamo/enums/company'
import { AnalysisTypeEnum, PersonStateEnum, PersonThirdPartyEnum } from '~/models/dynamo/enums/request'

export const s3ThirdPartyGetParamsResponseType = {
  answer: 'answer',
  validate: 'validate',
} as const

export type S3ThirdPartyAnswerPersonGetResponseType = keyof typeof s3ThirdPartyGetParamsResponseType

export type S3ThirdPartyAnswerPersonGetParams = {
  analysis_type: AnalysisTypeEnum
  company_request_person: CompanyRequestPersonConfigEnum
  person_id: string
  region?: PersonStateEnum
  request_id: string
  response_type: S3ThirdPartyAnswerPersonGetResponseType
  s3_client: S3Client
  third_party: PersonThirdPartyEnum
}

export type S3ThirdPartyAnswerPersonGetOutput = any | undefined

const S3_THIRD_PARTY_ANSWER = getStringEnv('S3_THIRD_PARTY_ANSWER')

const s3ThirdPartyAnswerPersonGet = async ({
  analysis_type,
  company_request_person,
  person_id,
  region,
  request_id,
  response_type,
  s3_client,
  third_party,
}: S3ThirdPartyAnswerPersonGetParams): Promise<S3ThirdPartyAnswerPersonGetOutput> => {
  // logger.debug({
  //   message: 'S3: GetObject',
  //   bucket: S3_THIRD_PARTY_ANSWER,
  //   company_request_person,
  //   person_id,
  //   region,
  //   request_id,
  //   third_party,
  // })

  let key = `${analysis_type}/${person_id}/${request_id}/${response_type}/${third_party}/${company_request_person}`

  if (region) {
    key = key.concat('_', region, '.json')
  } else {
    key = key.concat('.json')
  }

  const get_command = new GetObjectCommand({
    Bucket: S3_THIRD_PARTY_ANSWER,
    Key: key,
  })

  const result = await s3_client.send(get_command)

  const body = await result.Body?.transformToString()

  if (!body) {
    logger.debug({
      message: 'There is no data in this bucket and key',
      bucket: S3_THIRD_PARTY_ANSWER,
      key,
    })

    return undefined
  }

  return body
}

export default s3ThirdPartyAnswerPersonGet

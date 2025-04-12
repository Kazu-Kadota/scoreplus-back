import { S3Client } from '@aws-sdk/client-s3'
import { SQSClient } from '@aws-sdk/client-sqs'

import { gzipSync } from 'zlib'

import { thirdPartyCompanyRequestPersonConfigMap } from '~/constants/third-party-map'
import { AnalysisTypeEnum, PersonThirdPartyEnum } from '~/models/dynamo/enums/request'
import s3ThirdPartyAnswerPersonPut from '~/services/aws/s3/third-party/answer/person/put'
import { UseCaseValidatePersonAnalysisBody } from '~/use-cases/validate-person-analysis'

import sendAnswerAnalysisMessage from './send-answer-analysis-message'

export type AnswerBodyMapParams = UseCaseValidatePersonAnalysisBody & {
  person_id: string
  request_id: string
  s3Client: S3Client
  sqsClient: SQSClient
  validation_user_id: string
}

const validateBodyMap = async ({
  person_id,
  reason,
  region,
  request_id,
  result,
  s3Client,
  sqsClient,
  type,
  validation_user_id,
}: AnswerBodyMapParams): Promise<UseCaseValidatePersonAnalysisBody> => {
  const reason_compressed = gzipSync(reason ?? '')

  const s3_answer_key = await s3ThirdPartyAnswerPersonPut({
    analysis_type: AnalysisTypeEnum.PERSON,
    body: reason_compressed.toString('base64'),
    company_request_person: type,
    person_id,
    region,
    request_id,
    response_type: 'validate',
    s3_client: s3Client,
    third_party: thirdPartyCompanyRequestPersonConfigMap[type].split('_person')[0] as PersonThirdPartyEnum,
  })

  const answer_body: UseCaseValidatePersonAnalysisBody[] = [{
    reason: s3_answer_key,
    region,
    result,
    type,
  }]

  await sendAnswerAnalysisMessage({
    person_id,
    request_id,
    sqsClient,
    validation_user_id,
    validations_body: answer_body,
  })

  return {
    reason: s3_answer_key,
    region,
    result,
    type,
  }
}

export default validateBodyMap

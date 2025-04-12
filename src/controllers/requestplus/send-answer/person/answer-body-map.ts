import { S3Client } from '@aws-sdk/client-s3'
import { SQSClient } from '@aws-sdk/client-sqs'

import { gzipSync } from 'zlib'

import { thirdPartyCompanyRequestPersonConfigMap } from '~/constants/third-party-map'
import { AnalysisTypeEnum, PersonThirdPartyEnum } from '~/models/dynamo/enums/request'
import s3ThirdPartyAnswerPersonPut from '~/services/aws/s3/third-party/answer/person/put'
import { UseCaseSendPersonAnswersBody } from '~/use-cases/answer-person-analysis'

import sendAnswerAnalysisMessage from './send-answer-analysis-message'

export type AnswerBodyMapParams = UseCaseSendPersonAnswersBody & {
  person_id: string
  request_id: string
  s3Client: S3Client
  sqsClient: SQSClient
}

const answerBodyMap = async ({
  type,
  reason,
  region,
  person_id,
  request_id,
  s3Client,
  sqsClient,
}: AnswerBodyMapParams): Promise<UseCaseSendPersonAnswersBody> => {
  const reason_compressed = gzipSync(reason ?? '')

  const s3_answer_key = await s3ThirdPartyAnswerPersonPut({
    analysis_type: AnalysisTypeEnum.PERSON,
    body: reason_compressed.toString('base64'),
    company_request_person: type,
    person_id,
    region,
    request_id,
    response_type: 'answer',
    s3_client: s3Client,
    third_party: thirdPartyCompanyRequestPersonConfigMap[type].split('_person')[0] as PersonThirdPartyEnum,
  })

  const answer_body: UseCaseSendPersonAnswersBody[] = [{
    type,
    reason: s3_answer_key,
    region,
  }]

  await sendAnswerAnalysisMessage({
    answers_body: answer_body,
    person_id,
    request_id,
    sqsClient,
  })

  return {
    type,
    reason: s3_answer_key,
    region,
  }
}

export default answerBodyMap

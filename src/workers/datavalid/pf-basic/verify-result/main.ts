import { S3Client } from '@aws-sdk/client-s3'
import { SQSClient } from '@aws-sdk/client-sqs'
import { gzipSync } from 'zlib'

import { PFBasicResult } from '~/models/datavalid/pf-basic/result'
import { CompanyRequestPersonConfigEnum } from '~/models/dynamo/enums/company'
import { AnalysisTypeEnum, PersonThirdPartyEnum } from '~/models/dynamo/enums/request'
import s3ThirdPartyAnswerPersonPut from '~/services/aws/s3/third-party/answer/person/put'
import logger from '~/utils/logger'

import sendAnswerAnalysisMessage, { SendAnswerAnalysisMessageParams } from './send-answer-analysis-message'
import validateBody from './validate-body'
import verifyResult from './verify-result'

export type DatavalidVerifyResultPfBasic = {
  datavalid_result: PFBasicResult,
  person_id: string
  request_id: string
  s3Client: S3Client
  sqsClient: SQSClient
}

const datavalidVerifyResultPfBasic = async ({
  datavalid_result,
  person_id,
  request_id,
  s3Client,
  sqsClient,
}: DatavalidVerifyResultPfBasic): Promise<void> => {
  logger.debug({
    message: 'Start on verify result pf-basic',
    datavalid_result,
  })
  const body = validateBody(datavalid_result)

  const result = verifyResult(body)

  const use_case_send_person_answer: SendAnswerAnalysisMessageParams = {
    answers_body: [{
      type: CompanyRequestPersonConfigEnum.BIOMETRY_BASIC,
      reason: '',
    }],
    sqsClient,
    person_id,
    request_id,
  }

  if (!result.approved) {
    use_case_send_person_answer.answers_body[0].reason = 'Reprovado por análise biométrica básica. Detalhes: ' + JSON.stringify(result.reproved_data)
  }

  const s3_answer_key = await s3ThirdPartyAnswerPersonPut({
    analysis_type: AnalysisTypeEnum.PERSON,
    body: gzipSync(JSON.stringify(use_case_send_person_answer.answers_body[0].reason)).toString('base64'),
    company_request_person: CompanyRequestPersonConfigEnum.BIOMETRY_BASIC,
    person_id,
    request_id,
    response_type: 'answer',
    s3_client: s3Client,
    third_party: PersonThirdPartyEnum.DATAVALID,
  })

  use_case_send_person_answer.answers_body[0].reason = s3_answer_key

  await sendAnswerAnalysisMessage({
    answers_body: use_case_send_person_answer.answers_body,
    person_id,
    request_id,
    sqsClient,
  })

  logger.debug({
    message: 'Finish on verify result pf-basic',
    person_id,
  })
}

export default datavalidVerifyResultPfBasic

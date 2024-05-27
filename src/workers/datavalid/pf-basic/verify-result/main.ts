import { DynamoDBClient } from '@aws-sdk/client-dynamodb'

import { PFBasicResult } from '~/models/datavalid/pf-basic/result'
import { CompanyRequestPersonConfigEnum } from '~/models/dynamo/enums/company'
import { AnalysisResultEnum } from '~/models/dynamo/enums/request'
import useCaseSendPersonAnswer, { UseCaseSendPersonAnswerParams } from '~/use-cases/answer-person-analysis'
import logger from '~/utils/logger'

import validateBody from './validate-body'
import verifyResult from './verify-result'

export type DatavalidVerifyResultPfBasic = {
  datavalid_result: PFBasicResult,
  person_id: string
  request_id: string
  dynamodbClient: DynamoDBClient
}

const datavalidVerifyResultPfBasic = async ({
  datavalid_result,
  person_id,
  request_id,
  dynamodbClient,
}: DatavalidVerifyResultPfBasic): Promise<void> => {
  logger.debug({
    message: 'Start on verify result pf-basic',
  })
  const body = validateBody(datavalid_result)

  const result = verifyResult(body)

  const use_case_send_person_answer: UseCaseSendPersonAnswerParams = {
    answers_body: [{
      result: AnalysisResultEnum.APPROVED,
      type: CompanyRequestPersonConfigEnum.BIOMETRY_BASIC,
    }],
    dynamodbClient,
    person_id,
    request_id,
  }

  if (!result.approved) {
    use_case_send_person_answer.answers_body[0].result = AnalysisResultEnum.REJECTED
    use_case_send_person_answer.answers_body[0].reason = 'Reprovado por análise biométrica básica. Detalhes: ' + JSON.stringify(result.reproved_data)
  }

  await useCaseSendPersonAnswer(use_case_send_person_answer)

  logger.debug({
    message: 'Finish on verify result pf-basic',
    person_id,
  })
}

export default datavalidVerifyResultPfBasic

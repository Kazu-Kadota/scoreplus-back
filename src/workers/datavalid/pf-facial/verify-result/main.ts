import { DynamoDBClient } from '@aws-sdk/client-dynamodb'

import { PFFacialResult } from '~/models/datavalid/pf-facial/result'
import { CompanyRequestPersonConfigEnum } from '~/models/dynamo/enums/company'
import { AnalysisResultEnum } from '~/models/dynamo/enums/request'
import useCaseSendPersonAnswer, { UseCaseSendPersonAnswerParams } from '~/use-cases/answer-person-analysis'
import logger from '~/utils/logger'

import validateBody from './validate-body'
import verifyResult from './verify-result'

export type DatavalidVerifyResultPfFacial = {
  datavalid_result: PFFacialResult,
  person_id: string
  request_id: string
  dynamodbClient: DynamoDBClient
}

const datavalidVerifyResultPfFacial = async ({
  datavalid_result,
  person_id,
  request_id,
  dynamodbClient,
}: DatavalidVerifyResultPfFacial): Promise<void> => {
  logger.debug({
    message: 'Start on verify result pf-facial',
  })
  const body = validateBody(datavalid_result)

  const result = verifyResult(body)

  const use_case_send_person_answer: UseCaseSendPersonAnswerParams = {
    answers_body: [{
      result: AnalysisResultEnum.APPROVED,
      type: CompanyRequestPersonConfigEnum.BIOMETRY_FACIAL,
    }],
    dynamodbClient,
    person_id,
    request_id,
  }

  if (!result.approved) {
    use_case_send_person_answer.answers_body[0].result = AnalysisResultEnum.REJECTED
    use_case_send_person_answer.answers_body[0].reason = 'Reprovado por análise biométrica facial. Detalhes: ' + JSON.stringify(result.reproved_data)
  }

  await useCaseSendPersonAnswer(use_case_send_person_answer)

  logger.debug({
    message: 'Finish on verify result pf-facial',
    person_id,
  })
}

export default datavalidVerifyResultPfFacial

import { DynamoDBClient } from '@aws-sdk/client-dynamodb'

import { SQSController } from '~/models/lambda'
import useCaseSendPersonAnswer, { UseCaseSendPersonAnswerParams } from '~/use-cases/answer-person-analysis'
import logger from '~/utils/logger'

import validateBody from './validate-body'

export type AnswerPersonAnalysisWorkerMessageBody = Omit<UseCaseSendPersonAnswerParams, 'dynamodbClient'>

const dynamodbClient = new DynamoDBClient({
  region: 'us-east-1',
  maxAttempts: 5,
})

const answerPersonAnalysisWorker: SQSController = async (message) => {
  logger.debug({
    message: 'Start on answer person analysis',
  })

  const body = validateBody((message.body as AnswerPersonAnalysisWorkerMessageBody))

  const send_person_answer_params: UseCaseSendPersonAnswerParams = {
    ...body,
    dynamodbClient,
  }

  await useCaseSendPersonAnswer(send_person_answer_params)

  logger.info({
    message: 'Finish on answer request person analysis from eagle system response',
    person_id: body.person_id,
    request_id: body.request_id,
  })

  return {
    success: true,
    statusCode: 200,
  }
}

export default answerPersonAnalysisWorker

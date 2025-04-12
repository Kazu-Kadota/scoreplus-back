import { DynamoDBClient } from '@aws-sdk/client-dynamodb'

import { SQSController } from '~/models/lambda'
import useCaseSendVehicleAnswer, { UseCaseSendVehicleAnswerParams } from '~/use-cases/answer-vehicle-analysis'
import logger from '~/utils/logger'

import validateBody from './validate-body'

export type AnswerVehicleAnalysisWorkerMessageBody = Omit<UseCaseSendVehicleAnswerParams, 'dynamodbClient'>

const dynamodbClient = new DynamoDBClient({
  region: 'us-east-1',
  maxAttempts: 5,
})

const answerVehicleAnalysisWorker: SQSController = async (message) => {
  logger.debug({
    message: 'Start on answer vehicle analysis',
  })

  const body = validateBody((message.body as AnswerVehicleAnalysisWorkerMessageBody))

  const send_vehicle_answer_params: UseCaseSendVehicleAnswerParams = {
    ...body,
    dynamodbClient,
  }

  await useCaseSendVehicleAnswer(send_vehicle_answer_params)

  logger.info({
    message: 'Finish on answer request vehicle analysis from eagle system response',
    vehicle_id: body.vehicle_id,
    request_id: body.request_id,
  })

  return {
    success: true,
    statusCode: 200,
  }
}

export default answerVehicleAnalysisWorker

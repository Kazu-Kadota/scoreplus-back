import { DynamoDBClient } from '@aws-sdk/client-dynamodb'

import { Controller } from '~/models/lambda'
import logger from '~/utils/logger'

import sendVehicleAnswer, { SendVehicleAnswer } from './send-vehicle-answer'
import validateBody from './validate-body'
import validatePath from './validate-path'
import validateQueryVehicle from './validate-query-vehicle'

const dynamodbClient = new DynamoDBClient({ region: 'us-east-1' })

const sendAnswerVehicleController: Controller<true> = async (req) => {
  logger.debug({
    message: 'Start to send answer vehicle analysis',
  })

  const body = validateBody(JSON.parse(req.body as string))
  const { vehicle_id } = validatePath({ ...req.pathParameters })
  const { request_id } = validateQueryVehicle({ ...req.queryStringParameters })

  const data: SendVehicleAnswer = {
    request_id,
    answers_body: body,
    dynamodbClient,
    vehicle_id,
  }

  await sendVehicleAnswer(data)

  logger.info({
    message: 'Vehicle answer registered successfully',
    vehicle_id: data.vehicle_id,
  })

  return {
    body: {
      message: 'Vehicle answer registered successfully',
      vehicle_id: data.vehicle_id,
    },
  }
}

export default sendAnswerVehicleController

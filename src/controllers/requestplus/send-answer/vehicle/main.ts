import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { S3Client } from '@aws-sdk/client-s3'
import { SQSClient } from '@aws-sdk/client-sqs'

import { Controller } from '~/models/lambda'
import getRequestplusAnalysisVehicle from '~/services/aws/dynamo/request/analysis/vehicle/get'
import { UseCaseSendVehicleAnswerParams } from '~/use-cases/answer-vehicle-analysis'
import NotFoundError from '~/utils/errors/404-not-found'
import logger from '~/utils/logger'

import answerBodyMap from './answer-body-map'
import validateBody from './validate-body'
import validatePath from './validate-path'
import validateQueryVehicle from './validate-query-vehicle'

const dynamodbClient = new DynamoDBClient({
  region: 'us-east-1',
  maxAttempts: 5,
})

const sqsClient = new SQSClient({
  region: 'us-east-1',
  maxAttempts: 5,
})

const s3Client = new S3Client({
  region: 'us-east-1',
  maxAttempts: 5,
})

const sendAnswerVehicleController: Controller<true> = async (req) => {
  logger.debug({
    message: 'Start to send answer vehicle analysis',
  })

  const body = validateBody(JSON.parse(req.body as string))
  const { vehicle_id } = validatePath({ ...req.pathParameters })
  const { request_id } = validateQueryVehicle({ ...req.queryStringParameters })

  const data: UseCaseSendVehicleAnswerParams = {
    request_id,
    answers_body: body,
    dynamodbClient,
    vehicle_id,
  }

  const request_vehicle = await getRequestplusAnalysisVehicle({
    vehicle_id,
    request_id,
  }, dynamodbClient)

  if (!request_vehicle) {
    logger.warn({
      message: 'Vehicle to answer not found',
      vehicle_id,
      request_id,
    })

    throw new NotFoundError('Veículo não existe para ser respondido')
  }

  await Promise.all(body.map((answer) => answerBodyMap({
    vehicle_id,
    reason: answer.reason,
    region: answer.region,
    request_id,
    s3Client,
    sqsClient,
    type: answer.type,
  })))

  logger.info({
    message: 'Vehicle answer queued successfully',
    vehicle_id: data.vehicle_id,
  })

  return {
    body: {
      message: 'Vehicle answer queued successfully',
      vehicle_id: data.vehicle_id,
    },
  }
}

export default sendAnswerVehicleController

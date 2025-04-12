import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { S3Client } from '@aws-sdk/client-s3'
import { SQSClient } from '@aws-sdk/client-sqs'

import { Controller } from '~/models/lambda'
import getRequestplusValidateAnalysisVehicle from '~/services/aws/dynamo/request/validate/vehicle/get'
import NotFoundError from '~/utils/errors/404-not-found'
import logger from '~/utils/logger'

import validateBody from './validate-body'
import validateBodyMap from './validate-body-map'
import validatePath from './validate-path'
import validateQueryVehicle from './validate-query-vehicle'

const dynamoDBClient = new DynamoDBClient({
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

const sendValidationVehicleController: Controller<true> = async (req) => {
  logger.debug({
    message: 'Start to send answer vehicle analysis',
  })

  const body = validateBody(JSON.parse(req.body as string))
  const { vehicle_id } = validatePath({ ...req.pathParameters })
  const { request_id } = validateQueryVehicle({ ...req.queryStringParameters })

  const validate_vehicle = await getRequestplusValidateAnalysisVehicle({
    vehicle_id,
    request_id,
  }, dynamoDBClient)

  if (!validate_vehicle) {
    logger.warn({
      message: 'Vehicle to validate not found',
      vehicle_id,
      request_id,
    })

    throw new NotFoundError('Veículo não existe para ser validado')
  }

  await Promise.all(body.map((validate) => validateBodyMap({
    vehicle_id,
    reason: validate.reason,
    region: validate.region,
    request_id,
    result: validate.result,
    s3Client,
    sqsClient,
    type: validate.type,
    validation_user_id: req.user.user_id,
  })))

  logger.info({
    message: 'Vehicle answer registered successfully',
    vehicle_id,
  })

  return {
    body: {
      message: 'Vehicle answer registered successfully',
      vehicle_id,
    },
  }
}

export default sendValidationVehicleController

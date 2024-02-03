import { DynamoDBClient } from '@aws-sdk/client-dynamodb'

import { Controller } from '~/models/lambda'
import logger from '~/utils/logger'

import queryRequestVehicleByIdAdapter from './query-request-vehicle-by-id-adapter'
import validateParam from './validate-param'

const dynamodbClient = new DynamoDBClient({ region: 'us-east-1' })

const queryVehicleByIdController: Controller<true> = async (req) => {
  logger.debug({
    message: 'Start query vehicle by id',
  })

  const user_info = req.user

  const { vehicle_id } = validateParam({ ...req.pathParameters })

  const request_vehicle = await queryRequestVehicleByIdAdapter(
    vehicle_id,
    user_info,
    dynamodbClient,
  )

  logger.info({
    message: 'Finish on query vehicle by id',
    vehicle: request_vehicle,
  })

  return {
    body: {
      message: 'Finish on query vehicle by id',
      vehicle: request_vehicle,
    },
  }
}

export default queryVehicleByIdController

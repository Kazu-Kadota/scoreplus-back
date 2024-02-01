import { DynamoDBClient } from '@aws-sdk/client-dynamodb'

import { Controller } from '~/models/lambda'
import logger from '~/utils/logger'

import getRequestVehicleAdapter, { GetRequestVehicleAdapterParams } from './get-request-vehicle-adapter'
import validateVehicleParam from './validate-param'
import validateVehicleQuery from './validate-query'

const dynamodbClient = new DynamoDBClient({ region: 'us-east-1' })

const getVehicleController: Controller<true> = async (req) => {
  logger.debug({
    message: 'Start get vehicle request info',
  })

  const { vehicle_id } = validateVehicleParam({ ...req.pathParameters })
  const { request_id } = validateVehicleQuery({ ...req.queryStringParameters })

  const user_info = req.user

  const get_request_person_adapter_params: GetRequestVehicleAdapterParams = {
    dynamodbClient,
    request_id,
    user_info,
    vehicle_id,
  }

  const request_vehicle = await getRequestVehicleAdapter(get_request_person_adapter_params)

  logger.info({
    message: 'Finish on get vehicle request info',
    request_id,
    vehicle_id,
  })

  return {
    body: {
      message: 'Finish on get request vehicle',
      vehicle: request_vehicle,
    },
  }
}

export default getVehicleController

import { DynamoDBClient } from '@aws-sdk/client-dynamodb'

import { Controller } from '~/models/lambda'
import logger from '~/utils/logger'

import queryRequestVehicleByPlateAdapter from './query-request-vehicle-by-plate-adapter'
import validateQuery from './validate-query'

const dynamodbClient = new DynamoDBClient({ region: 'us-east-1' })

const queryVehicleByPlateController: Controller<true> = async (req) => {
  logger.debug({
    message: 'Start query vehicle analysis by plate',
  })

  const user_info = req.user
  const query_vehicle = validateQuery({ ...req.queryStringParameters })

  const data = await queryRequestVehicleByPlateAdapter(query_vehicle, dynamodbClient, user_info)

  logger.info({
    message: 'Finish on query vehicle analysis by plate',
  })

  return {
    body: {
      message: 'Finish on query vehicle analysis by plate',
      data,
    },
  }
}

export default queryVehicleByPlateController

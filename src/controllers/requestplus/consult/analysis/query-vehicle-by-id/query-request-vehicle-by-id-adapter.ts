import { DynamoDBClient } from '@aws-sdk/client-dynamodb'

import queryRequestplusAnalysisVehicleById, { QueryRequestplusAnalysisVehicleByIdQuery } from '~/services/aws/dynamo/request/analysis/vehicle/query-by-id'
import ForbiddenError from '~/utils/errors/403-forbidden'
import NotFoundError from '~/utils/errors/404-not-found'
import { UserFromJwt } from '~/utils/extract-jwt-lambda'
import logger from '~/utils/logger'

const queryRequestVehicleByIdAdapter = async (
  vehicle_id: string,
  user_info: UserFromJwt,
  dynamodbClient: DynamoDBClient,
) => {
  const query: QueryRequestplusAnalysisVehicleByIdQuery = {
    vehicle_id,
  }

  const request_vehicle = await queryRequestplusAnalysisVehicleById(query, dynamodbClient)

  if (!request_vehicle || !request_vehicle[0]) {
    logger.warn({
      message: 'Vehicle no exist',
      vehicle_id,
    })

    throw new NotFoundError('Veículo não existe')
  }

  const is_client_request = user_info.user_type === 'client'
    && user_info.company_name === request_vehicle[0].company_name

  if (!is_client_request) {
    logger.warn({
      message: 'Vehicle not requested to analyze from company',
      company_name: user_info,
      vehicle_id,
    })

    throw new ForbiddenError('Veículo não solicitado para análise pela empresa')
  }

  return request_vehicle[0]
}

export default queryRequestVehicleByIdAdapter

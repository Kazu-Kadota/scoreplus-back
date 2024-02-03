import { DynamoDBClient } from '@aws-sdk/client-dynamodb'

import { RequestStatusEnum } from '~/models/dynamo/enums/request'
import { RequestplusFinishedAnalysisVehicle, RequestplusFinishedAnalysisVehicleKey } from '~/models/dynamo/requestplus/finished-analysis-vehicle/table'
import getRequestplusFinishedAnalysisVehicle from '~/services/aws/dynamo/request/finished/vehicle/get'
import BadRequestError from '~/utils/errors/400-bad-request'
import NotFoundError from '~/utils/errors/404-not-found'
import logger from '~/utils/logger'

const getFinishedVehicleAnalysisAdapter = async (
  request_vehicle_key: RequestplusFinishedAnalysisVehicleKey,
  dynamodbClient: DynamoDBClient,
): Promise<RequestplusFinishedAnalysisVehicle> => {
  const finished_vehicle = await getRequestplusFinishedAnalysisVehicle(request_vehicle_key, dynamodbClient)

  if (!finished_vehicle) {
    logger.warn({
      message: 'Vehicle not exist or analysis not finished',
      ...request_vehicle_key,
    })

    throw new NotFoundError('Veículo não existe ou análise não finalizada')
  }

  if (finished_vehicle.status.general !== RequestStatusEnum.FINISHED) {
    logger.warn({
      message: 'Vehicle analysis not finished',
      ...request_vehicle_key,
    })

    throw new BadRequestError('Análise de veículo ainda não finalizada e não é possível gerar o extrato de liberação')
  }

  return finished_vehicle
}

export default getFinishedVehicleAnalysisAdapter

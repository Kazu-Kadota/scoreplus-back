import { DynamoDBClient } from '@aws-sdk/client-dynamodb'

import { RequestStatusEnum } from '~/models/dynamo/enums/request'
import { ComboReleaseExtractKey } from '~/models/dynamo/requestplus/combo'
import { RequestplusFinishedAnalysisVehicle } from '~/models/dynamo/requestplus/finished-analysis-vehicle/table'
import queryRequestplusFinishedAnalysisVehicleByComboId from '~/services/aws/dynamo/request/finished/vehicle/query-by-combo-id'
import BadRequestError from '~/utils/errors/400-bad-request'
import NotFoundError from '~/utils/errors/404-not-found'
import logger from '~/utils/logger'

const getFinishedVehicleAnalysisAdapter = async (
  combo_key: ComboReleaseExtractKey,
  dynamodbClient: DynamoDBClient,
): Promise<RequestplusFinishedAnalysisVehicle[]> => {
  const finished_vehicle = await queryRequestplusFinishedAnalysisVehicleByComboId(combo_key, dynamodbClient)

  if (!finished_vehicle || !finished_vehicle[0]) {
    logger.warn({
      message: 'Combo not exist',
      combo_id: combo_key.combo_id,
    })

    throw new NotFoundError('Combo não existe', 404)
  }

  if (finished_vehicle[0].status.general !== RequestStatusEnum.FINISHED) {
    logger.warn({
      message: 'Vehicle analysis not finished',
      ...combo_key,
    })

    throw new BadRequestError('Análise de veículo ainda não finalizada e não é possível gerar o extrato de liberação')
  }

  return finished_vehicle
}

export default getFinishedVehicleAnalysisAdapter

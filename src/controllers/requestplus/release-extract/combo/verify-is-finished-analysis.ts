import { DynamoDBClient } from '@aws-sdk/client-dynamodb'

import { RequestStatusEnum } from '~/models/dynamo/enums/request'
import { ComboReleaseExtractKey } from '~/models/dynamo/requestplus/combo'
import queryRequestplusAnalysisPersonByComboId from '~/services/aws/dynamo/request/analysis/person/query-by-combo-id'
import queryRequestplusAnalysisVehicleByComboId from '~/services/aws/dynamo/request/analysis/vehicle/query-by-combo-id'
import BadRequestError from '~/utils/errors/400-bad-request'
import logger from '~/utils/logger'

const verifyIsFinishedAnalysis = async (
  combo_key: ComboReleaseExtractKey,
  dynamodbClient: DynamoDBClient,
): Promise<void> => {
  const person = await queryRequestplusAnalysisPersonByComboId(combo_key, dynamodbClient)

  if (person && person[0] && person[0].status.general !== RequestStatusEnum.FINISHED) {
    logger.warn({
      message: 'Person analysis not finished',
      ...combo_key,
    })

    throw new BadRequestError('Análise de pessoa ainda não finalizada e não é possível gerar o extrato de liberação')
  }

  const finished_vehicle = await queryRequestplusAnalysisVehicleByComboId(combo_key, dynamodbClient)

  if (finished_vehicle && finished_vehicle[0] && finished_vehicle[0].status.general !== RequestStatusEnum.FINISHED) {
    logger.warn({
      message: 'Vehicle analysis not finished',
      ...combo_key,
    })

    throw new BadRequestError('Análise de veículo ainda não finalizada e não é possível gerar o extrato de liberação')
  }
}

export default verifyIsFinishedAnalysis

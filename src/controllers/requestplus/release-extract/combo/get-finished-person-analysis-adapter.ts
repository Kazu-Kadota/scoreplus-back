import { DynamoDBClient } from '@aws-sdk/client-dynamodb'

import { RequestStatusEnum } from '~/models/dynamo/enums/request'
import { ComboReleaseExtractKey } from '~/models/dynamo/requestplus/combo'
import { RequestplusFinishedAnalysisPerson } from '~/models/dynamo/requestplus/finished-analysis-person/table'
import queryRequestplusFinishedAnalysisPersonByComboId from '~/services/aws/dynamo/request/finished/person/query-by-combo-id'
import BadRequestError from '~/utils/errors/400-bad-request'
import NotFoundError from '~/utils/errors/404-not-found'
import logger from '~/utils/logger'

const getFinishedPersonAnalysisAdapter = async (
  combo_key: ComboReleaseExtractKey,
  dynamodbClient: DynamoDBClient,
): Promise<RequestplusFinishedAnalysisPerson> => {
  const finished_person = await queryRequestplusFinishedAnalysisPersonByComboId(combo_key, dynamodbClient)

  if (!finished_person || !finished_person[0]) {
    logger.warn({
      message: 'Combo not exist',
      combo_id: combo_key.combo_id,
    })

    throw new NotFoundError('Combo não existe', 404)
  }

  if (finished_person[0].status.general !== RequestStatusEnum.FINISHED) {
    logger.warn({
      message: 'Person analysis not finished',
      ...combo_key,
    })

    throw new BadRequestError('Análise de pessoa ainda não finalizada e não é possível gerar o extrato de liberação')
  }

  return finished_person[0]
}

export default getFinishedPersonAnalysisAdapter

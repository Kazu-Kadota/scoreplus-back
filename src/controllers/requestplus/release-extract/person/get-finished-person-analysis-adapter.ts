import { DynamoDBClient } from '@aws-sdk/client-dynamodb'

import { RequestStatusEnum } from '~/models/dynamo/enums/request'
import { RequestplusFinishedAnalysisPerson, RequestplusFinishedAnalysisPersonKey } from '~/models/dynamo/requestplus/finished-analysis-person/table'
import getRequestplusFinishedAnalysisPerson from '~/services/aws/dynamo/request/finished/person/get'
import BadRequestError from '~/utils/errors/400-bad-request'
import NotFoundError from '~/utils/errors/404-not-found'
import logger from '~/utils/logger'

const getFinishedPersonAnalysisAdapter = async (
  request_person_key: RequestplusFinishedAnalysisPersonKey,
  dynamodbClient: DynamoDBClient,
): Promise<RequestplusFinishedAnalysisPerson> => {
  const finished_person = await getRequestplusFinishedAnalysisPerson(request_person_key, dynamodbClient)

  if (!finished_person) {
    logger.warn({
      message: 'Person not exist or analysis not finished',
      ...request_person_key,
    })

    throw new NotFoundError('Pessoa não existe ou análise não finalizada')
  }

  if (finished_person.status.general !== RequestStatusEnum.FINISHED) {
    logger.warn({
      message: 'Person analysis not finished',
      ...request_person_key,
    })

    throw new BadRequestError('Análise de pessoa ainda não finalizada e não é possível gerar o extrato de liberação')
  }

  return finished_person
}

export default getFinishedPersonAnalysisAdapter

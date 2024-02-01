import { DynamoDBClient } from '@aws-sdk/client-dynamodb'

import { RequestplusAnalysisPerson } from '~/models/dynamo/requestplus/analysis-person/table'
import queryRequestplusAnalysisPersonById, { QueryRequestplusAnalysisPersonByIdQuery } from '~/services/aws/dynamo/request/analysis/person/query-by-id'
import ForbiddenError from '~/utils/errors/403-forbidden'
import NotFoundError from '~/utils/errors/404-not-found'
import { UserFromJwt } from '~/utils/extract-jwt-lambda'
import logger from '~/utils/logger'

const queryRequestPersonByIdAdapter = async (
  person_id: string,
  user_info: UserFromJwt,
  dynamodbClient: DynamoDBClient,
): Promise<RequestplusAnalysisPerson> => {
  const query: QueryRequestplusAnalysisPersonByIdQuery = {
    person_id,
  }
  const request_person = await queryRequestplusAnalysisPersonById(query, dynamodbClient)

  if (!request_person || !request_person[0]) {
    logger.warn({
      message: 'Person not exist',
      person_id,
    })

    throw new NotFoundError('Pessoa não existe')
  }

  const is_client_request = user_info.user_type === 'client'
    && user_info.company_name === request_person[0].company_name

  if (!is_client_request) {
    logger.warn({
      message: 'Person not requested to be analyzed from company',
      company_name: user_info,
      person_id,
    })

    throw new ForbiddenError('Pessoa não solicitada para análise pela empresa')
  }

  return request_person[0]
}

export default queryRequestPersonByIdAdapter

import { DynamoDBClient } from '@aws-sdk/client-dynamodb'

import { RequestplusAnalysisPerson } from '~/models/dynamo/requestplus/analysis-person/table'
import { RequestplusFinishedAnalysisPerson } from '~/models/dynamo/requestplus/finished-analysis-person/table'
import queryRequestplusAnalysisPersonByDocument from '~/services/aws/dynamo/request/analysis/person/query-by-document'
import queryRequestplusFinishedAnalysisPersonByDocument from '~/services/aws/dynamo/request/finished/person/query-by-document'
import NotFoundError from '~/utils/errors/404-not-found'
import { UserFromJwt } from '~/utils/extract-jwt-lambda'
import logger from '~/utils/logger'

import { RequestPersonByDocumentQuery } from './validate-query'

const queryRequestPersonByDocumentAdapter = async (
  query_person: RequestPersonByDocumentQuery,
  dynamodbClient: DynamoDBClient,
  user_info: UserFromJwt,
): Promise<(RequestplusFinishedAnalysisPerson | RequestplusAnalysisPerson)[]> => {
  const pending_analysis = await queryRequestplusAnalysisPersonByDocument(
    query_person,
    dynamodbClient,
  )

  const finished_analysis = await queryRequestplusFinishedAnalysisPersonByDocument(
    query_person,
    dynamodbClient,
  )

  if ((!pending_analysis || !pending_analysis[0]) && (!finished_analysis || !finished_analysis[0])) {
    logger.warn({
      message: 'Person not found with document',
      document: query_person.document,
    })

    throw new NotFoundError('Pessoa não encontrada pelo documento')
  }

  const data: (RequestplusFinishedAnalysisPerson | RequestplusAnalysisPerson)[] = []

  for (const item of pending_analysis as RequestplusAnalysisPerson[]) {
    if (user_info.user_type === 'client' && item.company_name === user_info.company_name) {
      data.push(item)
    } else if (user_info.user_type !== 'client') {
      data.push(item)
    }
  }

  for (const item of finished_analysis as RequestplusFinishedAnalysisPerson[]) {
    if (user_info.user_type === 'client' && item.company_name === user_info.company_name) {
      data.push(item)
    } else if (user_info.user_type !== 'client') {
      data.push(item)
    }
  }

  return data
}

export default queryRequestPersonByDocumentAdapter

import { DynamoDBClient } from '@aws-sdk/client-dynamodb'

import { RequestplusFinishedAnalysisPerson } from '~/models/dynamo/requestplus/finished-analysis-person/table'
import queryRequestplusFinishedAnalysisPersonByDocument from '~/services/aws/dynamo/request/finished/person/query-by-document'
import { UserFromJwt } from '~/utils/extract-jwt-lambda'

import { RequestPersonByDocumentQuery } from './validate-query'

export type QueryFinishedRequestPersonByDocumentAdapterParams = {
  query_person: RequestPersonByDocumentQuery,
  dynamodbClient: DynamoDBClient,
  user_info: UserFromJwt,
}

const queryFinishedRequestPersonByDocumentAdapter = async ({
  query_person,
  dynamodbClient,
  user_info,
}: QueryFinishedRequestPersonByDocumentAdapterParams): Promise<RequestplusFinishedAnalysisPerson[] | undefined> => {
  const finished_analysis = await queryRequestplusFinishedAnalysisPersonByDocument(
    query_person,
    dynamodbClient,
  )

  if (!finished_analysis || !finished_analysis[0]) {
    return undefined
  }

  (finished_analysis as RequestplusFinishedAnalysisPerson[]).sort(
    (r1, r2) => r1.created_at < r2.created_at
      ? 1
      : r1.created_at > r2.created_at
        ? -1
        : 0,
  )

  const data: RequestplusFinishedAnalysisPerson[] = []

  for (const item of finished_analysis as RequestplusFinishedAnalysisPerson[]) {
    if (user_info.user_type === 'client') {
      delete item.person_analysis_options.ethical?.reason
      item.person_analysis_options.history?.regions.forEach((region) => {
        delete region.reason
      })

      data.push(item)
    } else {
      data.push(item)
    }
  }

  return data
}

export default queryFinishedRequestPersonByDocumentAdapter

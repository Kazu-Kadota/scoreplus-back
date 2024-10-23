import { DynamoDBClient } from '@aws-sdk/client-dynamodb'

import { RequestplusAnalysisPerson } from '~/models/dynamo/requestplus/analysis-person/table'
import queryRequestplusAnalysisPersonByDocument from '~/services/aws/dynamo/request/analysis/person/query-by-document'
import { UserFromJwt } from '~/utils/extract-jwt-lambda'

import { RequestPersonByDocumentQuery } from './validate-query'

export type QueryRequestPersonByDocumentAdapterParams = {
  query_person: RequestPersonByDocumentQuery,
  dynamodbClient: DynamoDBClient,
  user_info: UserFromJwt,
}

const queryRequestPersonByDocumentAdapter = async ({
  query_person,
  dynamodbClient,
  user_info,
}: QueryRequestPersonByDocumentAdapterParams): Promise<RequestplusAnalysisPerson[] | undefined> => {
  const pending_analysis = await queryRequestplusAnalysisPersonByDocument(
    query_person,
    dynamodbClient,
  )

  if (!pending_analysis || !pending_analysis[0]) {
    return undefined
  }

  (pending_analysis as RequestplusAnalysisPerson[]).sort(
    (r1, r2) => r1.created_at < r2.created_at
      ? 1
      : r1.created_at > r2.created_at
        ? -1
        : 0,
  )

  const data: RequestplusAnalysisPerson[] = []

  for (const item of pending_analysis as RequestplusAnalysisPerson[]) {
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

export default queryRequestPersonByDocumentAdapter

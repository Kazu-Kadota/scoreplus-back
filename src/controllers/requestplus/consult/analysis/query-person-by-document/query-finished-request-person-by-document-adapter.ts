import { DynamoDBClient } from '@aws-sdk/client-dynamodb'

import { RequestplusFinishedAnalysisPerson } from '~/models/dynamo/requestplus/finished-analysis-person/table'
import queryRequestplusFinishedAnalysisPersonByDocument from '~/services/aws/dynamo/request/finished/person/query-by-document'

import { RequestPersonByDocumentQuery } from './validate-query'

export type QueryFinishedRequestPersonByDocumentAdapterParams = {
  dynamodbClient: DynamoDBClient,
  query_person: RequestPersonByDocumentQuery,
}

export type QueryFinishedRequestPersonByDocumentAdapterResponse = RequestplusFinishedAnalysisPerson

const queryFinishedRequestPersonByDocumentAdapter = async ({
  dynamodbClient,
  query_person,
}: QueryFinishedRequestPersonByDocumentAdapterParams): Promise<QueryFinishedRequestPersonByDocumentAdapterResponse[] | undefined> => {
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

  // const data: QueryFinishedRequestPersonByDocumentAdapterResponse[] = []

  // const result_map = await Promise.all(finished_analysis.map(async (item) => {
  //   if (user_info.user_type !== UserGroupEnum.CLIENT) {
  //     const person_analysis_options_map = await Promise.all(Object
  //       .entries(item.person_analysis_options)
  //       .map(([key, value]) => personAnalysisOptionMap({
  //         key,
  //         value,
  //         person_id: item.person_id,
  //         request_id: item.request_id,
  //         s3Client,
  //       },
  //       )))

  //     const person_analysis_options = person_analysis_options_map.reduce((prev, curr) => ({
  //       ...prev,
  //       ...curr,
  //     }), {} as any) as Partial<PersonAnalysisOptionsRequest<true>>

  //     item.person_analysis_options = person_analysis_options
  //   }

  //   return item
  // }))

  // data.push(...result_map)

  // for (const item of finished_analysis as RequestplusFinishedAnalysisPerson[]) {
  //   if (user_info.user_type === 'client') {
  //     delete item.person_analysis_options.ethical?.reason
  //     item.person_analysis_options.history?.regions.forEach((region) => {
  //       delete region.reason
  //     })

  //     data.push(item)
  //   } else {
  //     data.push(item)
  //   }
  // }

  return finished_analysis
}

export default queryFinishedRequestPersonByDocumentAdapter

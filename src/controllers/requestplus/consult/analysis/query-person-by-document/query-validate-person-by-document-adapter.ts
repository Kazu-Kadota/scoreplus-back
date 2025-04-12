import { DynamoDBClient } from '@aws-sdk/client-dynamodb'

import { RequestplusValidateAnalysisPerson } from '~/models/dynamo/requestplus/validate-analysis-person/table'
import queryRequestplusValidateAnalysisPersonByDocument from '~/services/aws/dynamo/request/validate/person/query-by-document'

import { RequestPersonByDocumentQuery } from './validate-query'

export type QueryValidatePersonByDocumentAdapterParams = {
  dynamodbClient: DynamoDBClient,
  query_person: RequestPersonByDocumentQuery,
}

export type QueryValidatePersonByDocumentAdapterResponse = RequestplusValidateAnalysisPerson

const queryValidatePersonByDocumentAdapter = async ({
  dynamodbClient,
  query_person,
}: QueryValidatePersonByDocumentAdapterParams): Promise<QueryValidatePersonByDocumentAdapterResponse[] | undefined> => {
  const validate_analysis = await queryRequestplusValidateAnalysisPersonByDocument(
    query_person,
    dynamodbClient,
  )

  if (!validate_analysis || !validate_analysis[0]) {
    return undefined
  }

  (validate_analysis).sort(
    (r1, r2) => r1.created_at < r2.created_at
      ? 1
      : r1.created_at > r2.created_at
        ? -1
        : 0,
  )

  // const data: QueryFinishedRequestPersonByDocumentAdapterResponse[] = []

  // const result_map = await Promise.all(pending_analysis.map(async (item) => {
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
  //     }), {} as any) as Partial<PersonAnalysisOptionsRequest<false>>

  //     item.person_analysis_options = person_analysis_options
  //   }

  //   return item
  // }))

  // data.push(...result_map)

  // for (const item of pending_analysis) {
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

  return validate_analysis
}

export default queryValidatePersonByDocumentAdapter

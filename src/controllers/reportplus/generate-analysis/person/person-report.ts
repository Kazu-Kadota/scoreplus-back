import { DynamoDBClient } from '@aws-sdk/client-dynamodb'

import { CompanyRequestPersonConfigEnum } from '~/models/dynamo/enums/company'
import { AnalysisResultEnum, AnalysisTypeEnum } from '~/models/dynamo/enums/request'
import queryRequestplusAnalysisPersonByCompany, { QueryRequestplusAnalysisPersonByCompanyQuery, QueryRequestplusAnalysisPersonByCompanyResponse } from '~/services/aws/dynamo/request/analysis/person/query-by-company'
import queryRequestplusFinishedAnalysisPersonByCompany, { QueryFinishedRequestPersonByCompanyResponse } from '~/services/aws/dynamo/request/finished/person/query-by-company'
import { MappedObject } from '~/utils/types/mapped-object'

import { PersonReportCSVHeader } from './convert-csv'

export type PersonReportResult = MappedObject<
  MappedObject<PersonReportCSVHeader, {
    [Key in CompanyRequestPersonConfigEnum]?: boolean
  }>, {
    analysis_type: AnalysisTypeEnum
    combo_id: string
    combo_number: number
    result?: AnalysisResultEnum
}>

export type PersonReportResponse = {
  result: PersonReportResult[]
  count: number
}

const personReport = async (
  data: QueryRequestplusAnalysisPersonByCompanyQuery,
  dynamodbClient: DynamoDBClient,
): Promise<PersonReportResponse> => {
  const result: PersonReportResult[] = []
  let last_evaluated_key
  let count: number = 0

  do {
    const query_waiting_processing_result: QueryRequestplusAnalysisPersonByCompanyResponse | undefined = await queryRequestplusAnalysisPersonByCompany(
      data,
      dynamodbClient,
      last_evaluated_key,
    )

    if (!query_waiting_processing_result) {
      break
    }

    for (const item of query_waiting_processing_result.result) {
      const person_analysis_options_contructor = Object
        .keys(item.person_analysis_options)
        .reduce((prev, key) => {
          return {
            ...prev,
            [key]: true,
          }
        }, {})
      result.push({
        ...person_analysis_options_contructor,
        analysis_type: item.analysis_type,
        combo_id: item.combo_id,
        combo_number: item.combo_number,
        company_name: item.company_name,
        created_at: item.created_at,
        document: item.document,
        name: item.name,
        person_id: item.person_id,
        request_id: item.request_id,
      })
    }

    count += query_waiting_processing_result.count

    last_evaluated_key = query_waiting_processing_result.last_evaluated_key
  } while (last_evaluated_key)

  do {
    const query_finished_result: QueryFinishedRequestPersonByCompanyResponse | undefined = await queryRequestplusFinishedAnalysisPersonByCompany(
      data,
      dynamodbClient,
      last_evaluated_key,
    )

    if (!query_finished_result) {
      break
    }

    for (const item of query_finished_result.result) {
      const person_analysis_options_contructor = Object
        .keys(item.person_analysis_options)
        .reduce((prev, key) => {
          return {
            ...prev,
            [key]: true,
          }
        }, {})
      result.push({
        ...person_analysis_options_contructor,
        analysis_type: item.analysis_type,
        combo_id: item.combo_id,
        combo_number: item.combo_number,
        company_name: item.company_name,
        created_at: item.created_at,
        document: item.document,
        name: item.name,
        person_id: item.person_id,
        request_id: item.request_id,
        finished_at: item.finished_at,
        result: item.result,
      })
    }

    count += query_finished_result.count

    last_evaluated_key = query_finished_result.last_evaluated_key
  } while (last_evaluated_key)

  result.sort(
    (r1, r2) => r1.created_at > r2.created_at
      ? 1
      : r1.created_at < r2.created_at
        ? -1
        : 0,
  )

  return {
    result,
    count,
  }
}

export default personReport

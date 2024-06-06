import { DynamoDBClient } from '@aws-sdk/client-dynamodb'

import { CompanyRequestVehicleConfigEnum } from '~/models/dynamo/enums/company'
import { AnalysisResultEnum, VehicleType } from '~/models/dynamo/enums/request'
import queryRequestplusAnalysisVehicleByCompany, { QueryRequestVehicleByCompany, QueryRequestVehicleByCompanyResponse } from '~/services/aws/dynamo/request/analysis/vehicle/query-by-company'
import queryRequestplusFinishedAnalysisVehicleByCompany, { QueryFinishedRequestVehicleByCompanyResponse } from '~/services/aws/dynamo/request/finished/vehicle/query-by-company'
import { MappedObject } from '~/utils/types/mapped-object'

import { VehicleReportCSVHeader } from './convert-csv'

export type VehicleReportResult = MappedObject<
MappedObject<VehicleReportCSVHeader, {
  [Key in CompanyRequestVehicleConfigEnum]?: boolean
}>, {
  combo_id: string
  combo_number: number
  result?: AnalysisResultEnum
  vehicle_type: VehicleType
}>

export type VehicleReportResponse = {
  result: VehicleReportResult[]
  count: number
}

const vehicleReport = async (
  data: QueryRequestVehicleByCompany,
  dynamodbClient: DynamoDBClient,
): Promise<VehicleReportResponse> => {
  const result: VehicleReportResult[] = []
  let last_evaluated_key
  let count: number = 0

  do {
    const query_waiting_processing_result: QueryRequestVehicleByCompanyResponse | undefined = await queryRequestplusAnalysisVehicleByCompany(
      data,
      dynamodbClient,
      last_evaluated_key,
    )

    if (!query_waiting_processing_result) {
      break
    }

    for (const item of query_waiting_processing_result.result) {
      const vehicle_analysis_options_contructor = Object
        .keys(item.vehicle_analysis_options)
        .reduce((prev, key) => {
          return {
            ...prev,
            [key]: true,
          }
        }, {})
      result.push({
        ...vehicle_analysis_options_contructor,
        owner_document: item.owner_document,
        owner_name: item.owner_name,
        plate: item.plate,
        combo_id: item.combo_id,
        combo_number: item.combo_number,
        company_name: item.company_name,
        created_at: item.created_at,
        request_id: item.request_id,
        vehicle_id: item.vehicle_id,
        vehicle_type: item.vehicle_type,
      })
    }

    count += query_waiting_processing_result.count

    last_evaluated_key = query_waiting_processing_result?.last_evaluated_key
  } while (last_evaluated_key)

  do {
    const query_finished_result: QueryFinishedRequestVehicleByCompanyResponse | undefined = await queryRequestplusFinishedAnalysisVehicleByCompany(
      data,
      dynamodbClient,
      last_evaluated_key,
    )

    if (!query_finished_result) {
      break
    }

    for (const item of query_finished_result.result) {
      const vehicle_analysis_options_contructor = Object
        .keys(item.vehicle_analysis_options)
        .reduce((prev, key) => {
          return {
            ...prev,
            [key]: true,
          }
        }, {})
      result.push({
        ...vehicle_analysis_options_contructor,
        owner_document: item.owner_document,
        owner_name: item.owner_name,
        plate: item.plate,
        combo_id: item.combo_id,
        combo_number: item.combo_number,
        company_name: item.company_name,
        created_at: item.created_at,
        request_id: item.request_id,
        vehicle_id: item.vehicle_id,
        vehicle_type: item.vehicle_type,
        finished_at: item.finished_at,
        result: item.result,
      })
    }
    count += query_finished_result.count

    last_evaluated_key = query_finished_result?.last_evaluated_key
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

export default vehicleReport

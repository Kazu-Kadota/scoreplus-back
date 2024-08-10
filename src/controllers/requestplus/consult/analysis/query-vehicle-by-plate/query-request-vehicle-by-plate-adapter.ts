import { DynamoDBClient } from '@aws-sdk/client-dynamodb'

import { RequestplusAnalysisVehicle } from '~/models/dynamo/requestplus/analysis-vehicle/table'
import queryRequestplusAnalysisVehicleByPlate from '~/services/aws/dynamo/request/analysis/vehicle/query-by-plate'
import { UserFromJwt } from '~/utils/extract-jwt-lambda'

import { RequestVehicleByPlateQuery } from './validate-query'

export type QueryRequestVehicleByPlateAdapterParams = {
  query_vehicle: RequestVehicleByPlateQuery,
  dynamodbClient: DynamoDBClient,
  user_info: UserFromJwt,
}

const queryRequestVehicleByPlateAdapter = async ({
  query_vehicle,
  dynamodbClient,
  user_info,
}: QueryRequestVehicleByPlateAdapterParams): Promise<RequestplusAnalysisVehicle[] | undefined> => {
  const pending_analysis = await queryRequestplusAnalysisVehicleByPlate(
    query_vehicle,
    dynamodbClient,
  )

  if (!pending_analysis || !pending_analysis[0]) {
    return undefined
  }

  (pending_analysis as RequestplusAnalysisVehicle[]).sort(
    (r1, r2) => r1.created_at < r2.created_at
      ? 1
      : r1.created_at > r2.created_at
        ? -1
        : 0,
  )

  const data: RequestplusAnalysisVehicle[] = []

  for (const item of pending_analysis as RequestplusAnalysisVehicle[]) {
    if (user_info.user_type === 'client') {
      delete item.vehicle_analysis_options.ethical?.reason
      item.vehicle_analysis_options['plate-history']?.regions.forEach((region) => {
        delete region.reason
      })

      data.push(item)
    } else {
      data.push(item)
    }
  }

  return data
}

export default queryRequestVehicleByPlateAdapter

import { DynamoDBClient } from '@aws-sdk/client-dynamodb'

import { RequestplusFinishedAnalysisVehicle } from '~/models/dynamo/requestplus/finished-analysis-vehicle/table'
import queryRequestFinishedVehicleByPlate from '~/services/aws/dynamo/request/finished/vehicle/query-by-plate'
import { UserFromJwt } from '~/utils/extract-jwt-lambda'

import { RequestVehicleByPlateQuery } from './validate-query'

export type QueryFinishedRequestVehicleByPlateAdapterParams = {
  query_vehicle: RequestVehicleByPlateQuery,
  dynamodbClient: DynamoDBClient,
  user_info: UserFromJwt,
}

const queryFinishedRequestVehicleByPlateAdapter = async ({
  query_vehicle,
  dynamodbClient,
  user_info,
}: QueryFinishedRequestVehicleByPlateAdapterParams): Promise<RequestplusFinishedAnalysisVehicle[] | undefined> => {
  const finished_analysis = await queryRequestFinishedVehicleByPlate(
    query_vehicle,
    dynamodbClient,
  )

  if (!finished_analysis || !finished_analysis[0]) {
    return undefined
  }

  (finished_analysis as RequestplusFinishedAnalysisVehicle[]).sort(
    (r1, r2) => r1.created_at < r2.created_at
      ? 1
      : r1.created_at > r2.created_at
        ? -1
        : 0,
  )

  const data: RequestplusFinishedAnalysisVehicle[] = []

  for (const item of finished_analysis as RequestplusFinishedAnalysisVehicle[]) {
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

export default queryFinishedRequestVehicleByPlateAdapter

import { DynamoDBClient } from '@aws-sdk/client-dynamodb'

import { RequestplusValidateAnalysisVehicle } from '~/models/dynamo/requestplus/validate-analysis-vehicle/table'
import queryRequestplusValidateAnalysisVehicleByPlate from '~/services/aws/dynamo/request/validate/vehicle/query-by-plate'

import { RequestVehicleByPlateQuery } from './validate-query'

export type QueryValidateVehicleByPlateAdapterParams = {
  dynamodbClient: DynamoDBClient,
  query_vehicle: RequestVehicleByPlateQuery,
}

export type QueryValidateVehicleByPlateAdapterResponse = RequestplusValidateAnalysisVehicle

const queryValidateVehicleByPlateAdapter = async ({
  dynamodbClient,
  query_vehicle,
}: QueryValidateVehicleByPlateAdapterParams): Promise<QueryValidateVehicleByPlateAdapterResponse[] | undefined> => {
  const validate_analysis = await queryRequestplusValidateAnalysisVehicleByPlate(
    query_vehicle,
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

  // const data: QueryFinishedRequestVehicleByPlateAdapterResponse[] = []

  // const result_map = await Promise.all(pending_analysis.map(async (item) => {
  //   if (user_info.user_type !== UserGroupEnum.CLIENT) {
  //     const vehicle_analysis_options_map = await Promise.all(Object
  //       .entries(item.vehicle_analysis_options)
  //       .map(([key, value]) => vehicleAnalysisOptionMap({
  //         key,
  //         value,
  //         vehicle_id: item.vehicle_id,
  //         request_id: item.request_id,
  //         s3Client,
  //       },
  //       )))

  //     const vehicle_analysis_options = vehicle_analysis_options_map.reduce((prev, curr) => ({
  //       ...prev,
  //       ...curr,
  //     }), {} as any) as Partial<VehicleRequestplusValidateAnalysisVehicleAnalysisOptionsRequest<false>>

  //     item.vehicle_analysis_options = vehicle_analysis_options
  //   }

  //   return item
  // }))

  // data.push(...result_map)

  // for (const item of pending_analysis) {
  //   if (user_info.user_type === 'client') {
  //     delete item.vehicle_analysis_options.ethical?.reason
  //     item.vehicle_analysis_options.history?.regions.forEach((region) => {
  //       delete region.reason
  //     })

  //     data.push(item)
  //   } else {
  //     data.push(item)
  //   }
  // }

  return validate_analysis
}

export default queryValidateVehicleByPlateAdapter

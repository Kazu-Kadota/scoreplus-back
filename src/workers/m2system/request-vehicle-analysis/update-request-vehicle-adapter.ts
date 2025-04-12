import { DynamoDBClient } from '@aws-sdk/client-dynamodb'

import { RequestplusAnalysisVehicle, RequestplusAnalysisVehicleBody, RequestplusAnalysisVehicleKey } from '~/models/dynamo/requestplus/analysis-vehicle/table'
import { M2VehicleRequestAnalysisResponse } from '~/models/m2system/request/analysis-vehicle'
import updateRequestVehicle from '~/services/aws/dynamo/request/analysis/vehicle/update'

import thirdPartyConstructor from './third-party-constructor'

export type UpdateRequestVehicleAdapterParams = {
  m2_request_vehicle_analysis: M2VehicleRequestAnalysisResponse
  request_vehicle: RequestplusAnalysisVehicle
  dynamodbClient: DynamoDBClient
}

const updateRequestVehicleAdapter = async ({
  m2_request_vehicle_analysis,
  request_vehicle,
  dynamodbClient,
}: UpdateRequestVehicleAdapterParams): Promise<void> => {
  const third_party = thirdPartyConstructor({
    m2_request_vehicle_analysis,
    request_vehicle,
  })

  request_vehicle.third_party = third_party

  const { vehicle_id, request_id, ...rest } = request_vehicle

  const key: RequestplusAnalysisVehicleKey = {
    vehicle_id,
    request_id,
  }

  const body: RequestplusAnalysisVehicleBody = rest

  await updateRequestVehicle(key, body, dynamodbClient)
}

export default updateRequestVehicleAdapter

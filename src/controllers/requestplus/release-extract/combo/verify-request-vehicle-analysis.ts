import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { ComboReleaseExtractKey } from 'src/models/dynamo/combo'
import queryRequestVehicleByComboId from 'src/services/aws/dynamo/request/analysis/vehicle/query-by-combo-id'

const verifyRequestVehicleAnalysis = async (
  combo_key: ComboReleaseExtractKey,
  dynamodbClient: DynamoDBClient,
): Promise<string[] | undefined> => {
  const finished_vehicle = await queryRequestVehicleByComboId(combo_key, dynamodbClient)

  if (!finished_vehicle || !finished_vehicle[0]) {
    return
  }

  const request_id: string[] = []

  finished_vehicle.forEach((vehicle) => {
    request_id.push(vehicle.request_id)
  })

  return request_id
}

export default verifyRequestVehicleAnalysis

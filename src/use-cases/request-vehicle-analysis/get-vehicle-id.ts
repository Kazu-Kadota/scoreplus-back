import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { v4 as uuid } from 'uuid'

import { PlateStateEnum } from '~/models/dynamo/enums/request'
import queryVehicleByPlate, { QueryPersonByDocumentQuery } from '~/services/aws/dynamo/analysis/vehicle/query-by-plate'
import queryRequestplusAnalysisVehicleByPlate, { QueryRequestplusAnalysisVehicleByPlateQuery } from '~/services/aws/dynamo/request/analysis/vehicle/query-by-plate'

const getVehicleId = async (
  plate: string,
  plate_state: PlateStateEnum,
  dynamodbClient: DynamoDBClient,
) => {
  const query: QueryPersonByDocumentQuery = {
    plate,
    plate_state,
  }
  const vehicle = await queryVehicleByPlate(query, dynamodbClient)

  if (vehicle && vehicle[0]) {
    return vehicle[0].vehicle_id
  }

  const query_requested_vehicle: QueryRequestplusAnalysisVehicleByPlateQuery = {
    plate,
    plate_state,
  }

  const requested_vehicle = await queryRequestplusAnalysisVehicleByPlate(
    query_requested_vehicle,
    dynamodbClient,
  )

  if (requested_vehicle && requested_vehicle[0]) {
    return requested_vehicle[0].vehicle_id
  }

  return uuid()
}

export default getVehicleId

import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { AnalysisTypeEnum, PlateStateEnum, RequestStatusEnum } from 'src/models/dynamo/request-enum'
import { VehicleAnalysisConfig, VehicleRequestKey } from 'src/models/dynamo/request-vehicle'
import { VehicleRequestPlateHistoryBody, VehicleRequestPlateHistoryForms } from 'src/models/dynamo/request-vehicle-plate-history'
import putRequestVehiclePlateHistory from 'src/services/aws/dynamo/request/analysis/vehicle/plate-history/put'
import { UserInfoFromJwt } from 'src/utils/extract-jwt-lambda'
import logger from 'src/utils/logger'
import removeEmpty from 'src/utils/remove-empty'
import { v4 as uuid } from 'uuid'

import getVehicleId from './get-vehicle-id'

export interface ReturnVehicleAnalysis {
  request_id: string
  vehicle_id: string
  plate: string
  plate_state: PlateStateEnum
}

export interface VehicleAnalysisRequest {
  analysis_type: AnalysisTypeEnum
  dynamodbClient: DynamoDBClient
  user_info: UserInfoFromJwt
  vehicle_data: VehicleRequestPlateHistoryForms
  vehicle_analysis_config: VehicleAnalysisConfig
}

const vehicleAnalysis = async (
  data: VehicleAnalysisRequest,
): Promise<ReturnVehicleAnalysis> => {
  const {
    analysis_type,
    dynamodbClient,
    user_info,
    vehicle_data,
    vehicle_analysis_config,
  } = data

  logger.debug({
    message: 'Requested vehicle analysis',
    analysis_type,
    company_name: user_info.company_name,
    user_id: user_info.user_id,
  })

  const request_id = uuid()

  const vehicle_id = await getVehicleId(vehicle_data.plate, vehicle_data.plate_state, dynamodbClient)

  const data_request_vehicle: VehicleRequestPlateHistoryBody = {
    ...vehicle_data,
    analysis_type,
    company_name: user_info.user_type === 'admin' ? vehicle_data.company_name as string : user_info.company_name,
    user_id: user_info.user_id,
    status: RequestStatusEnum.WAITING,
    vehicle_analysis_config,
  }

  const request_vehicle_body = removeEmpty(data_request_vehicle)

  const request_vehicle_key: VehicleRequestKey = {
    request_id,
    vehicle_id,
  }

  await putRequestVehiclePlateHistory(request_vehicle_key, request_vehicle_body, dynamodbClient)

  logger.debug({
    message: 'Successfully requested vehicle analysis',
    request_id,
    vehicle_id,
    plate: vehicle_data.plate,
  })

  return {
    request_id,
    vehicle_id,
    plate: vehicle_data.plate,
    plate_state: vehicle_data.plate_state,
  }
}

export default vehicleAnalysis

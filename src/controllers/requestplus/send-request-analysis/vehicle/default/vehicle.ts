import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { AnalysisTypeEnum, RequestStatusEnum } from 'src/models/dynamo/request-enum'
import { VehicleAnalysisConfig, VehicleRequestBody, VehicleRequestForms, VehicleRequestKey } from 'src/models/dynamo/request-vehicle'
import putRequestVehicle from 'src/services/aws/dynamo/request/analysis/vehicle/put'
import { UserInfoFromJwt } from 'src/utils/extract-jwt-lambda'
import logger from 'src/utils/logger'
import removeEmpty from 'src/utils/remove-empty'
import { v4 as uuid } from 'uuid'

import getVehicleId from './get-vehicle-id'

export interface ReturnVehicleAnalysis {
  company_name: string
  owner_name: string
  plate: string
  request_id: string
  user_id: string
  vehicle_id: string
}

export interface VehicleAnalysisRequest {
  analysis_type: AnalysisTypeEnum
  combo_number?: number
  combo_id?: string
  dynamodbClient: DynamoDBClient
  user_info: UserInfoFromJwt
  vehicle_data: VehicleRequestForms
  vehicle_analysis_config: VehicleAnalysisConfig
}

const vehicleAnalysis = async (
  data: VehicleAnalysisRequest,
): Promise<ReturnVehicleAnalysis> => {
  const {
    analysis_type,
    combo_number,
    combo_id,
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

  const data_request_vehicle: VehicleRequestBody = {
    ...vehicle_data,
    analysis_type,
    combo_number: combo_number || undefined,
    combo_id,
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

  await putRequestVehicle(request_vehicle_key, request_vehicle_body, dynamodbClient)

  logger.debug({
    message: 'Successfully requested vehicle analysis',
    request_id,
    vehicle_id,
    owner_name: vehicle_data.owner_name,
    plate: vehicle_data.plate,
  })

  return {
    request_id,
    vehicle_id,
    company_name: user_info.company_name,
    user_id: user_info.user_id,
    owner_name: vehicle_data.owner_name,
    plate: vehicle_data.plate,
  }
}

export default vehicleAnalysis

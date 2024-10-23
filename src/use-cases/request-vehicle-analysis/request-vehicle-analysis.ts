import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { v4 as uuid } from 'uuid'

import { AnalysisTypeEnum, PlateStateEnum } from '~/models/dynamo/enums/request'
import { VehicleRequestForms } from '~/models/dynamo/requestplus/analysis-vehicle/forms'
import { RequestplusAnalysisVehicleBody, RequestplusAnalysisVehicleKey } from '~/models/dynamo/requestplus/analysis-vehicle/table'
import { VehicleAnalysisOptionsRequest, VehicleAnalysisOptionsToRequest } from '~/models/dynamo/requestplus/analysis-vehicle/vehicle-analysis-options'
import { VehicleAnalysisType } from '~/models/dynamo/requestplus/analysis-vehicle/vehicle-analysis-type'
import { CompanyRequestVehicleConfig } from '~/models/dynamo/userplus/company'
import { M2VehicleAnalysisResponse } from '~/models/m2system/request/analysis-vehicle'
import putRequestplusAnalysisVehicle from '~/services/aws/dynamo/request/analysis/vehicle/put'
import { UserFromJwt } from '~/utils/extract-jwt-lambda'
import logger from '~/utils/logger'
import removeEmpty from '~/utils/remove-empty'

import getVehicleId from './get-vehicle-id'
import sendVehicleAnalysisToM2System from './send-vehicle-analysis-to-m2system'
import vehicleAnalysisOptionsConstructor from './vehicle-analysis-options-constructor'
import vehicleStatusConstructor from './vehicle-status-constructor'

export type VehicleAnalysisResponse = {
  analysis_type: AnalysisTypeEnum
  plate: string
  plate_state: PlateStateEnum
  vehicle_analysis_options: Partial<VehicleAnalysisOptionsRequest<false>>
  vehicle_analysis_type: VehicleAnalysisType
  vehicle_id: string
  vehicle_request_id: string
}

export type VehicleAnalysisRequest = {
  analysis_type: AnalysisTypeEnum
  combo_id?: string
  combo_number?: number
  company_request_vehicle_config: CompanyRequestVehicleConfig
  dynamodbClient: DynamoDBClient
  user_info: UserFromJwt
  vehicle_analysis_options_to_request: VehicleAnalysisOptionsToRequest
  vehicle_analysis_type: VehicleAnalysisType
  vehicle_data: VehicleRequestForms
}

const requestVehicleAnalysis = async ({
  analysis_type,
  combo_id,
  combo_number,
  company_request_vehicle_config,
  dynamodbClient,
  user_info,
  vehicle_analysis_options_to_request,
  vehicle_analysis_type,
  vehicle_data,
}: VehicleAnalysisRequest): Promise<VehicleAnalysisResponse> => {
  logger.debug({
    message: 'Requested vehicle analysis',
    analysis_type,
  })

  const request_id = uuid()

  const vehicle_id = await getVehicleId(vehicle_data.plate, vehicle_data.plate_state, dynamodbClient)

  const vehicle_analysis_options = vehicleAnalysisOptionsConstructor(
    vehicle_analysis_options_to_request,
    company_request_vehicle_config,
  )

  const status = vehicleStatusConstructor(vehicle_analysis_options)

  let m2_request: M2VehicleAnalysisResponse[] | undefined

  if (vehicle_data.company_name !== 'SCORE PLUS TECH LTDA') {
    m2_request = await sendVehicleAnalysisToM2System({
      company_request_vehicle_config,
      vehicle_analysis_options_to_request,
      vehicle_data,
    })
  }

  const data_request_vehicle: RequestplusAnalysisVehicleBody = {
    ...vehicle_data,
    analysis_type,
    combo_id,
    combo_number: combo_number || undefined,
    company_name: user_info.user_type === 'admin' ? vehicle_data.company_name as string : user_info.company_name,
    m2_request,
    status,
    user_id: user_info.user_id,
    vehicle_analysis_options,
    vehicle_analysis_type,
  }

  const request_vehicle_body = removeEmpty(data_request_vehicle)

  const request_vehicle_key: RequestplusAnalysisVehicleKey = {
    request_id,
    vehicle_id,
  }

  await putRequestplusAnalysisVehicle(request_vehicle_key, request_vehicle_body, dynamodbClient)

  logger.debug({
    message: 'Successfully requested vehicle analysis',
    vehicle_request_id: request_id,
    vehicle_id,
  })

  return {
    analysis_type,
    plate: vehicle_data.plate,
    plate_state: vehicle_data.plate_state,
    vehicle_analysis_options,
    vehicle_analysis_type,
    vehicle_id,
    vehicle_request_id: request_id,
  }
}

export default requestVehicleAnalysis

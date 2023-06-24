import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { AnalysisTypeEnum, RequestStatusEnum } from 'src/models/dynamo/request-enum'
import { VehicleRequestBody, VehicleRequestForms, VehicleRequestKey } from 'src/models/dynamo/request-vehicle'
import queryVehicleByPlate from 'src/services/aws/dynamo/analysis/vehicle/query-by-plate'
import putRequestVehicle from 'src/services/aws/dynamo/request/analysis/vehicle/put'
import queryRequestVehicleByPlate, { QueryRequestVehicleByPlateQuery } from 'src/services/aws/dynamo/request/analysis/vehicle/query-by-plate'
import ErrorHandler from 'src/utils/error-handler'
import { UserInfoFromJwt } from 'src/utils/extract-jwt-lambda'
import logger from 'src/utils/logger'
import removeEmpty from 'src/utils/remove-empty'
import { v4 as uuid } from 'uuid'

export interface ReturnVehicleAnalysis {
  request_id: string
  vehicle_id: string
  company_name: string
  user_id: string
  owner_name: string
  plate: string
}

export interface VehicleAnalysisRequest {
  analysis_type: AnalysisTypeEnum
  body: VehicleRequestForms
  dynamodbClient: DynamoDBClient
  user_info: UserInfoFromJwt
  combo_number?: number
}

const vehicleAnalysis = async (
  data: VehicleAnalysisRequest,
): Promise<ReturnVehicleAnalysis> => {
  const {
    analysis_type,
    body,
    dynamodbClient,
    user_info,
    combo_number,
  } = data

  logger.debug({
    message: 'Requested vehicle analysis',
    analysis_type,
    company_name: user_info.company_name,
    user_id: user_info.user_id,
  })

  if (user_info.user_type === 'admin' && !body.company_name) {
    logger.warn({
      message: 'Need to inform company name for admin user',
      user_type: user_info.user_type,
    })

    throw new ErrorHandler('É necessário informar o nome da empresa para usuários admin', 400)
  }

  const request_id = uuid()

  const vehicle = await queryVehicleByPlate(body.plate, body.plate_state, dynamodbClient)

  const query_requested_vehicle: QueryRequestVehicleByPlateQuery = {
    plate: body.plate,
    plate_state: body.plate_state,
  }

  const requested_vehicle = await queryRequestVehicleByPlate(
    query_requested_vehicle,
    dynamodbClient,
  )

  let vehicle_id: string

  if (vehicle && vehicle[0]) {
    vehicle_id = vehicle[0].vehicle_id
  } else if (requested_vehicle && requested_vehicle[0]) {
    vehicle_id = requested_vehicle[0].vehicle_id
  } else {
    vehicle_id = uuid()
  }

  const data_request_vehicle: VehicleRequestBody = {
    ...body,
    analysis_type,
    combo_number: combo_number || undefined,
    company_name: user_info.user_type === 'admin' ? body.company_name as string : user_info.company_name,
    user_id: user_info.user_id,
    status: RequestStatusEnum.WAITING,
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
    owner_name: body.owner_name,
    plate: body.plate,
  })

  return {
    request_id,
    vehicle_id,
    company_name: user_info.company_name,
    user_id: user_info.user_id,
    owner_name: body.owner_name,
    plate: body.plate,
  }
}

export default vehicleAnalysis

import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { SNSClient } from '@aws-sdk/client-sns'
import { AnalysisTypeEnum } from 'src/models/dynamo/request-enum'
import { Controller } from 'src/models/lambda'
import ErrorHandler from 'src/utils/error-handler'
import { UserInfoFromJwt } from 'src/utils/extract-jwt-lambda'
import logger from 'src/utils/logger'
import removeEmpty from 'src/utils/remove-empty'

import getCompanyAdapter from '../../get-company-adapter'

import publishSnsTopicVehicleAdapter, { publishSnsTopicVehicleAdapterParams } from './publish-sns-topic-vehicle-adapter'
import validateBodyVehicle from './validate-body-vehicle'
import vehicleAnalysis, { VehicleAnalysisRequest } from './vehicle'

const dynamodbClient = new DynamoDBClient({
  region: 'us-east-1',
  maxAttempts: 5,
})

const snsClient = new SNSClient({
  region: 'us-east-1',
  maxAttempts: 5,
})

const requestAnalysisVehicleDefault: Controller = async (req) => {
  const event_body = removeEmpty(JSON.parse(req.body as string))
  const body = validateBodyVehicle(event_body)

  const user_info = req.user_info as UserInfoFromJwt

  if (user_info.user_type === 'admin' && !body.vehicle.company_name) {
    logger.warn({
      message: 'Need to inform company name for admin user',
      user_type: user_info.user_type,
    })

    throw new ErrorHandler('É necessário informar o nome da empresa para usuários admin', 400)
  } else if (user_info.user_type === 'client' && body.vehicle.company_name) {
    logger.warn({
      message: 'User not allowed to inform company_name',
      user_type: user_info.user_type,
    })

    throw new ErrorHandler('Usuário não permitido em informar company_name', 400)
  }

  const company_name = body.vehicle.company_name ? body.vehicle.company_name : user_info.company_name
  const company = await getCompanyAdapter(company_name, dynamodbClient)

  const vehicle_analysis_constructor: VehicleAnalysisRequest = {
    analysis_type: AnalysisTypeEnum.VEHICLE,
    dynamodbClient,
    user_info,
    vehicle_data: body.vehicle,
    vehicle_analysis_config: body.vehicle_analysis_config,
  }

  const vehicle_analysis = await vehicleAnalysis(vehicle_analysis_constructor)

  const vehicle_params: publishSnsTopicVehicleAdapterParams = {
    company,
    request_id: vehicle_analysis.request_id,
    vehicle_data: body.vehicle,
    vehicle_id: vehicle_analysis.vehicle_id,
  }

  await publishSnsTopicVehicleAdapter(vehicle_params, snsClient)

  logger.info({
    message: 'Successfully requested to analyze vehicle',
    vehicle_id: vehicle_analysis.vehicle_id,
    plate: vehicle_analysis.plate,
  })

  return {
    body: {
      message: 'Successfully requested to analyze vehicle',
      ...vehicle_analysis,
    },
  }
}

export default requestAnalysisVehicleDefault

import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { SNSClient } from '@aws-sdk/client-sns'

import getCompanyAdapter from '../get-company-adapter'
import { AnalysisTypeEnum } from '~/models/dynamo/enums/request'
import { Controller } from '~/models/lambda'
import useCaseRequestVehicleAnalysis, { UseCaseRequestVehicleAnalysis } from '~/use-cases/request-vehicle-analysis.ts'
import BadRequestError from '~/utils/errors/400-bad-request'
import logger from '~/utils/logger'

import validateBodyVehicle from './validate-body-vehicle'

const dynamodbClient = new DynamoDBClient({
  region: 'us-east-1',
  maxAttempts: 5,
})

const snsClient = new SNSClient({
  region: 'us-east-1',
  maxAttempts: 5,
})

const requestAnalysisVehicleDefault: Controller<true> = async (req) => {
  logger.debug({
    message: 'Start request vehicle analysis path',
  })
  const body = validateBodyVehicle(JSON.parse(req.body as string))

  const user_info = req.user

  if (user_info.user_type === 'admin' && !body.vehicle.company_name) {
    logger.warn({
      message: 'Need to inform company name for admin user',
    })

    throw new BadRequestError('É necessário informar o nome da empresa para usuários admin')
  } else if (user_info.user_type === 'client' && body.vehicle.company_name) {
    logger.warn({
      message: 'User not allowed to inform company_name',
    })

    throw new BadRequestError('Usuário não permitido em informar company_name')
  }

  const company_name = body.vehicle.company_name ? body.vehicle.company_name : user_info.company_name
  const company = await getCompanyAdapter(company_name, dynamodbClient)

  const use_case_request_vehicle_analysis: UseCaseRequestVehicleAnalysis = {
    analysis_type: AnalysisTypeEnum.VEHICLE,
    dynamodbClient,
    company_request_vehicle_config: company.request_vehicle_config,
    snsClient,
    user_info,
    vehicle_analysis_options_to_request: body.vehicle_analysis_options_to_request,
    vehicle_analysis_type: body.vehicle_analysis_type,
    vehicle_data: body.vehicle,
  }

  const vehicle_analysis = await useCaseRequestVehicleAnalysis(use_case_request_vehicle_analysis)

  logger.info({
    message: 'Successfully requested to analyze vehicle',
    vehicle_id: vehicle_analysis.vehicle_id,
    vehicle_request_id: vehicle_analysis.vehicle_request_id,
  })

  return {
    body: {
      message: 'Successfully requested to analyze vehicle',
      vehicle_analysis,
    },
  }
}

export default requestAnalysisVehicleDefault

import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { SNSClient } from '@aws-sdk/client-sns'
import { v4 as uuid } from 'uuid'

import getCompanyAdapter from '../get-company-adapter'
import { AnalysisTypeEnum } from '~/models/dynamo/enums/request'
import { Controller } from '~/models/lambda'
import useCaseRequestPersonAnalysis, { UseCaseRequestPersonAnalysis } from '~/use-cases/request-person-analysis'
import useCaseRequestVehicleAnalysis, { UseCaseRequestVehicleAnalysis } from '~/use-cases/request-vehicle-analysis'
import { VehicleAnalysisResponse } from '~/use-cases/request-vehicle-analysis/request-vehicle-analysis'
import BadRequestError from '~/utils/errors/400-bad-request'
import logger from '~/utils/logger'

import validateBodyCombo from './validate-body-combo'

const dynamodbClient = new DynamoDBClient({
  region: 'us-east-1',
  maxAttempts: 5,
})

const snsClient = new SNSClient({
  region: 'us-east-1',
  maxAttempts: 5,
})

const requestAnalysis: Controller<true> = async (req) => {
  logger.debug({
    message: 'Start request combo analysis path',
  })
  const body = validateBodyCombo(JSON.parse(req.body as string))

  const user_info = req.user

  if (body.combo_number !== body.vehicles.length) {
    logger.warn({
      message: 'Number of vehicles informed is different to number of vehicles requested',
    })

    throw new BadRequestError('Número de veículos informado é diferente ao númbero de veículos solicitados')
  }

  if (user_info.user_type === 'admin' && !body.person.company_name) {
    logger.warn({
      message: 'Need to inform company name for admin user',
    })

    throw new BadRequestError('É necessário informar o nome da empresa para usuários admin')
  } else if (user_info.user_type === 'client' && body.person.company_name) {
    logger.warn({
      message: 'User not allowed to inform company_name',
    })

    throw new BadRequestError('Usuário não permitido em informar company_name')
  }

  const company_name = body.person.company_name ? body.person.company_name : user_info.company_name
  const company = await getCompanyAdapter(company_name, dynamodbClient)

  const combo_id = uuid()

  const use_case_request_person_analysis: UseCaseRequestPersonAnalysis = {
    analysis_type: AnalysisTypeEnum.PERSON,
    combo_id,
    combo_number: body.combo_number,
    company_request_person_config: company.request_person_config,
    dynamodbClient,
    person_analysis_options_to_request: body.person_analysis_options_to_request,
    person_analysis_type: body.person_analysis_type,
    person_data: body.person,
    snsClient,
    user_info,
  }

  const person_analysis = await useCaseRequestPersonAnalysis(use_case_request_person_analysis)

  const vehicles_analysis: VehicleAnalysisResponse[] = []

  for (const vehicle of body.vehicles) {
    const use_case_request_vehicle_analysis: UseCaseRequestVehicleAnalysis = {
      analysis_type: AnalysisTypeEnum.VEHICLE,
      combo_id,
      combo_number: body.combo_number,
      company_request_vehicle_config: company.request_vehicle_config,
      dynamodbClient,
      snsClient,
      user_info,
      vehicle_analysis_options_to_request: vehicle.vehicle_analysis_options_to_request,
      vehicle_analysis_type: vehicle.vehicle_analysis_type,
      vehicle_data: vehicle.vehicle,
    }

    const vehicle_analysis = await useCaseRequestVehicleAnalysis(use_case_request_vehicle_analysis)

    vehicles_analysis.push(vehicle_analysis)
  }

  const vehicle_ids: string[] = []
  const vehicle_request_ids: string[] = []

  vehicles_analysis.forEach((vehicle) => {
    vehicle_ids.push(vehicle.vehicle_id)
    vehicle_request_ids.push(vehicle.vehicle_request_id)
  })

  logger.info({
    message: 'Successfully requested to analyze combo',
    person_id: person_analysis.person_id,
    person_request_id: person_analysis.person_request_id,
    vehicle_ids,
    vehicle_request_ids,
  })

  return {
    body: {
      message: 'Successfully requested to analyze combo',
      analysis_type: AnalysisTypeEnum.COMBO,
      combo_id,
      person: person_analysis,
      vehicles: vehicles_analysis,
    },
  }
}

export default requestAnalysis

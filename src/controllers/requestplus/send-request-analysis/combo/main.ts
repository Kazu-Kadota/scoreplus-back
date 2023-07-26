import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { SQSClient } from '@aws-sdk/client-sqs'
import { AnalysisTypeEnum } from 'src/models/dynamo/request-enum'
import { Controller } from 'src/models/lambda'
import ErrorHandler from 'src/utils/error-handler'
import { UserInfoFromJwt } from 'src/utils/extract-jwt-lambda'
import logger from 'src/utils/logger'
import removeEmpty from 'src/utils/remove-empty'
import { v4 as uuid } from 'uuid'

import getCompanyAdapter from '../get-company-adapter'
import personAnalysisConstructor, { PersonAnalysisConstructor } from '../person/person-analysis-constructor'
import sendMessageFacialBiometryAdapter, { SendMessageFacialBiometryAdapterParams } from '../person/send-message-facial-biometry-adapter'
import vehicleAnalysis, { ReturnVehicleAnalysis, VehicleAnalysisRequest } from '../vehicle/default/vehicle'

import validateBodyCombo from './validate-body-combo'

const dynamodbClient = new DynamoDBClient({
  region: 'us-east-1',
  maxAttempts: 5,
})
const sqsClient = new SQSClient({
  region: 'us-east-1',
  maxAttempts: 5,
})

const requestAnalysis: Controller = async (req) => {
  const event_body = removeEmpty(JSON.parse(req.body as string))
  const body = validateBodyCombo(event_body)

  const user_info = req.user_info as UserInfoFromJwt

  if (body.combo_number !== body.vehicles.length) {
    logger.warn({
      message: 'Number of vehicles informed is different to number of vehicles requested',
    })

    throw new ErrorHandler('Número de veículos informado é diferente ao númbero de veículos solicitados', 400)
  }

  if (user_info.user_type === 'admin' && !body.person.company_name) {
    logger.warn({
      message: 'Need to inform company name for admin user',
      user_type: user_info.user_type,
    })

    throw new ErrorHandler('É necessário informar o nome da empresa para usuários admin', 400)
  } else if (user_info.user_type === 'client' && body.person.company_name) {
    logger.warn({
      message: 'User not allowed to inform company_name',
      user_type: user_info.user_type,
    })

    throw new ErrorHandler('Usuário não permitido em informar company_name', 400)
  }

  const company_name = body.person.company_name ? body.person.company_name : user_info.company_name
  const company = await getCompanyAdapter(company_name, dynamodbClient)

  const person_analyzes = []

  const combo_id = uuid()

  for (const person_analysis of body.person_analysis) {
    const person_analysis_request: PersonAnalysisConstructor = {
      analysis_type: AnalysisTypeEnum.COMBO,
      combo_number: body.combo_number,
      combo_id,
      company_system_config: company.system_config,
      dynamodbClient,
      person_data: body.person,
      person_analysis_config: body.person_analysis_config,
      user_info,
    }

    person_analyzes.push(await personAnalysisConstructor(person_analysis, person_analysis_request))
  }

  const request_ids: string[] = []

  person_analyzes.forEach((first_array_itens) => {
    first_array_itens.forEach((second_array_itens: any) => {
      request_ids.push(second_array_itens.request_id)
    })
  })

  const send_message_facial_biometry_adapter_params: SendMessageFacialBiometryAdapterParams = {
    data: body.person,
    person_id: person_analyzes[0][0].person_id,
    request_ids,
  }

  if (company.system_config.biometry === true) {
    await sendMessageFacialBiometryAdapter(send_message_facial_biometry_adapter_params, sqsClient)
  }

  const vehicles_analysis: ReturnVehicleAnalysis[] = []

  for (const vehicle_analysis of body.vehicles) {
    vehicle_analysis.vehicle.driver_name = body.person.name
    const vehicle_analysis_constructor: VehicleAnalysisRequest = {
      analysis_type: AnalysisTypeEnum.VEHICLE,
      combo_number: body.combo_number,
      combo_id,
      dynamodbClient,
      user_info,
      vehicle_data: vehicle_analysis.vehicle,
      vehicle_analysis_config: vehicle_analysis.vehicle_analysis_config,
    }

    vehicles_analysis.push(await vehicleAnalysis(vehicle_analysis_constructor))
  }

  const vehicle_ids: string[] = []

  vehicles_analysis.forEach((vehicle) => {
    vehicle_ids.push(vehicle.vehicle_id)
  })

  logger.info({
    message: 'Successfully requested to analyze combo',
    person_id: person_analyzes[0][0].person_id,
    vehicle_id: vehicle_ids,
  })

  return {
    body: {
      message: 'Successfully requested to analyze combo',
      analysis_type: AnalysisTypeEnum.COMBO,
      combo_id,
      person: person_analyzes,
      vehicles: vehicles_analysis,
    },
  }
}

export default requestAnalysis

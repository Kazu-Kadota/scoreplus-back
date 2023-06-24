import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { SQSClient } from '@aws-sdk/client-sqs'
import { APIGatewayProxyEvent } from 'aws-lambda'
import { AnalysisTypeEnum } from 'src/models/dynamo/request-enum'
import { ReturnResponse } from 'src/models/lambda'
import ErrorHandler from 'src/utils/error-handler'
import { UserInfoFromJwt } from 'src/utils/extract-jwt-lambda'
import logger from 'src/utils/logger'
import removeEmpty from 'src/utils/remove-empty'

import personAnalysisConstructor, { PersonAnalysisConstructor } from './person/person-analysis-constructor'
import sendMessageFacialBiometryAdapter, { SendMessageFacialBiometryAdapterParams } from './person/send-message-facial-biometry-adapter'
import validateBodyCombo from './validate/validate-body-combo'
import validateBodyPerson from './validate/validate-body-person'
import validateBodyVehicle from './validate/validate-body-vehicle'
import validatePath from './validate/validate-path'
import vehicleAnalysis, { ReturnVehicleAnalysis, VehicleAnalysisRequest } from './vehicle/vehicle'

const dynamodbClient = new DynamoDBClient({
  region: 'us-east-1',
  maxAttempts: 5,
})
const sqsClient = new SQSClient({
  region: 'us-east-1',
  maxAttempts: 5,
})

const requestAnalysis = async (
  event: APIGatewayProxyEvent,
  user_info: UserInfoFromJwt,
): Promise<ReturnResponse<any>> => {
  const { analysis_type } = validatePath({ ...event.pathParameters })
  const event_body = removeEmpty(JSON.parse(event.body as string))

  if (analysis_type === 'person') {
    const body = validateBodyPerson(event_body)

    const person_analyzes = []

    for (const person_analysis of body.person_analysis) {
      const person_analysis_request: PersonAnalysisConstructor = {
        analysis_type,
        person_data: body.person,
        dynamodbClient,
        user_info,
        sqsClient,
      }

      person_analyzes.push(await personAnalysisConstructor(person_analysis, person_analysis_request))
    }

    const request_ids: string[] = []

    person_analyzes.forEach((first_array_itens) => {
      first_array_itens.forEach((second_array_itens) => {
        request_ids.push(second_array_itens.request_id)
      })
    })

    const send_message_facial_biometry_adapter_params: SendMessageFacialBiometryAdapterParams = {
      data: body.person,
      person_id: person_analyzes[0][0].person_id,
      request_ids,
    }

    await sendMessageFacialBiometryAdapter(send_message_facial_biometry_adapter_params, sqsClient)

    logger.info({
      message: 'Successfully requested to analyze person',
      person_id: person_analyzes[0][0].person_id,
    })

    return {
      body: {
        message: 'Successfully requested to analyze person',
        person_analyzes: person_analyzes.flat(),
      },
    }
  } else if (analysis_type === 'vehicle') {
    const body = validateBodyVehicle(event_body)

    const vehicle_analysis_constructor: VehicleAnalysisRequest = {
      analysis_type,
      body,
      dynamodbClient,
      user_info,
    }

    const vehicle_analysis = await vehicleAnalysis(vehicle_analysis_constructor)

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
  } else if (analysis_type === 'combo') {
    const body = validateBodyCombo(event_body)

    if (body.combo_number !== body.vehicles.length) {
      logger.warn({
        message: 'Number of vehicles informed is different to number of vehicles requested',
        analysis_type,
      })

      throw new ErrorHandler('Número de veículos informado é diferente ao númbero de veículos solicitados', 400)
    }

    const person_analyzes = []

    for (const person_analysis of body.person_analysis) {
      const person_analysis_request: PersonAnalysisConstructor = {
        analysis_type,
        combo_number: body.combo_number,
        dynamodbClient,
        person_data: body.person,
        sqsClient,
        user_info,
      }

      person_analyzes.push(await personAnalysisConstructor(person_analysis, person_analysis_request))
    }

    const request_ids: string[] = []

    person_analyzes.forEach((first_array_itens) => {
      first_array_itens.forEach((second_array_itens) => {
        request_ids.push(second_array_itens.request_id)
      })
    })

    const send_message_facial_biometry_adapter_params: SendMessageFacialBiometryAdapterParams = {
      data: body.person,
      person_id: person_analyzes[0][0].person_id,
      request_ids,
    }

    await sendMessageFacialBiometryAdapter(send_message_facial_biometry_adapter_params, sqsClient)

    const vehicles_analysis: ReturnVehicleAnalysis[] = []

    for (const vehicle of body.vehicles) {
      vehicle.driver_name = body.person.name
      const vehicle_analysis_constructor: VehicleAnalysisRequest = {
        analysis_type: AnalysisTypeEnum.VEHICLE,
        body: vehicle,
        dynamodbClient,
        user_info,
        combo_number: body.combo_number,
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
        analysis_type,
        person: person_analyzes,
        vehicles: vehicles_analysis,
      },
    }
  } else {
    logger.error({
      message: 'Invalid path type. Must be simple, national, vehicle or combo',
      analysis_type,
    })

    throw new ErrorHandler('Path inválido. Deve ser simple, national, vehicle ou combo', 400)
  }
}

export default requestAnalysis

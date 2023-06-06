import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { APIGatewayProxyEvent } from 'aws-lambda'
import { AnalysisTypeEnum } from 'src/models/dynamo/request-enum'
import { ReturnResponse } from 'src/models/lambda'
import ErrorHandler from 'src/utils/error-handler'
import { UserInfoFromJwt } from 'src/utils/extract-jwt-lambda'
import logger from 'src/utils/logger'
import removeEmpty from 'src/utils/remove-empty'

import personAnalysisConstructor, { PersonAnalysisConstructor } from './person_analysis_constructor'
import validateBodyCombo from './validate/validate-body-combo'
import validateBodyPerson from './validate/validate-body-person'
import validateBodyVehicle from './validate/validate-body-vehicle'
import validatePath from './validate/validate-path'
import vehicleAnalysis, { ReturnVehicleAnalysis, VehicleAnalysisRequest } from './vehicle'

const dynamodbClient = new DynamoDBClient({ region: 'us-east-1' })

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
      }

      person_analyzes.push(await personAnalysisConstructor(person_analysis, person_analysis_request))
    }

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

    let person_analyzes

    for (const person_analysis of body.person_analysis) {
      const person_analysis_request: PersonAnalysisConstructor = {
        analysis_type,
        person_data: body.person,
        dynamodbClient,
        user_info,
        combo_number: body.combo_number,
      }

      person_analyzes = await personAnalysisConstructor(person_analysis, person_analysis_request)
    }

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

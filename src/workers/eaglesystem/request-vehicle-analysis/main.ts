import { DynamoDBClient } from '@aws-sdk/client-dynamodb'

import { CompanyRequestVehicleConfigEnum } from '~/models/dynamo/enums/company'
import { SQSController } from '~/models/lambda'
import eagleRequestAnalysisVehicleANTT from '~/services/eagle/request/analysis-vehicle-antt'
import eagleRequestAnalysisVehicleBasicData from '~/services/eagle/request/analysis-vehicle-basic-data'
import { EagleSystemRequestConstructorResponse } from '~/use-cases/publish-sns-topic-vehicle/eagle-system-request-constructor'
import InternalServerError from '~/utils/errors/500-internal-server-error'
import logger from '~/utils/logger'

import getRequestVehicleAdapter from './get-request-vehicle-adapter'
import updateRequestVehicleAdapter from './update-request-vehicle-adapter'
import validateBody from './validate-body'

export type EagleSystemRequestVehicleAnalysis = {
  [CompanyRequestVehicleConfigEnum.ANTT]?: EagleSystemRequestConstructorResponse
  [CompanyRequestVehicleConfigEnum.BASIC_DATA]?: EagleSystemRequestConstructorResponse
  [CompanyRequestVehicleConfigEnum.CRONOTACOGRAFO]?: EagleSystemRequestConstructorResponse
}

const dynamodbClient = new DynamoDBClient({
  region: 'us-east-1',
  maxAttempts: 5,
})

const eagleSystemRequestVehicleAnalysis: SQSController = async (message) => {
  logger.debug({
    message: 'Start on send request vehicle analysis to eagle system',
  })

  const request_id = message.message_attributes.request_id.stringValue
  const vehicle_id = message.message_attributes.vehicle_id.stringValue

  if (!request_id) {
    logger.warn({
      message: 'Not informed request_id in message_attributes',
      ...message,
    })

    throw new InternalServerError('Not informed request ids in message attributes')
  }

  if (!vehicle_id) {
    logger.warn({
      message: 'Not informed vehicle_id in message attributes',
      ...message,
    })

    throw new InternalServerError('Not informed vehicle_id in message attributes')
  }

  const message_body = message.body as EagleSystemRequestVehicleAnalysis

  for (const [key, validate_body] of Object.entries(message_body)) {
    const company_vehicle_config = key as CompanyRequestVehicleConfigEnum
    if (company_vehicle_config === CompanyRequestVehicleConfigEnum.ANTT) {
      const body = validateBody(validate_body as EagleSystemRequestConstructorResponse)

      const eagle_request_vehicle_analysis = await eagleRequestAnalysisVehicleANTT({
        body: body.data,
      })

      const request_vehicle = await getRequestVehicleAdapter({
        dynamodbClient,
        vehicle_id,
        request_id,
      })

      await updateRequestVehicleAdapter({
        eagle_request_vehicle_analysis,
        request_vehicle,
        dynamodbClient,
      })
    } else if (company_vehicle_config === CompanyRequestVehicleConfigEnum.BASIC_DATA) {
      const body = validateBody(validate_body as EagleSystemRequestConstructorResponse)

      const eagle_request_vehicle_analysis = await eagleRequestAnalysisVehicleBasicData({
        body: body.data,
      })

      const request_vehicle = await getRequestVehicleAdapter({
        dynamodbClient,
        vehicle_id,
        request_id,
      })

      await updateRequestVehicleAdapter({
        eagle_request_vehicle_analysis,
        request_vehicle,
        dynamodbClient,
      })
    } else {
      logger.warn({
        message: 'There is no Company Vehicle Config that is mappeded to be requested',
        company_vehicle_config,
        request_id,
        vehicle_id,
      })

      throw new InternalServerError('There is no Company Vehicle Config that is mappeded to be requested')
    }
  }

  logger.info({
    message: 'Finish on send request vehicle analysis to eagle system',
    vehicle_id,
    request_id,
  })

  return {
    success: true,
    statusCode: 200,
  }
}

export default eagleSystemRequestVehicleAnalysis

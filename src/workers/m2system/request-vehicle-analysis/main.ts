import { DynamoDBClient } from '@aws-sdk/client-dynamodb'

import { CompanyRequestVehicleConfigEnum } from '~/models/dynamo/enums/company'
import { SQSController } from '~/models/lambda'
import m2RequestAnalysisVehicle from '~/services/m2/request/analysis-vehicle-default'
import m2RequestAnalysisVehiclePlateHistory from '~/services/m2/request/analysis-vehicle-plate-history'
import { M2SystemEthicalAnalysisConstructorResponse } from '~/use-cases/publish-sns-topic-vehicle/m2-ethical-analysis-constructor'
import { M2SystemPlateHistoryAnalysisConstructorResponse } from '~/use-cases/publish-sns-topic-vehicle/m2-plate-history-analysis-constructor'
import InternalServerError from '~/utils/errors/500-internal-server-error'
import logger from '~/utils/logger'

import getRequestVehicleAdapter from './get-request-vehicle-adapter'
import updateRequestVehicleAdapter from './update-request-vehicle-adapter'
import validateEthicalBody from './validate-ethical-body'
import validatePlateHistoryBody from './validate-plate-history-body'

export type M2SystemRequestVehicleAnalysis = {
  [CompanyRequestVehicleConfigEnum.ETHICAL]?: M2SystemEthicalAnalysisConstructorResponse
  [CompanyRequestVehicleConfigEnum.PLATE_HISTORY]?: Array<M2SystemPlateHistoryAnalysisConstructorResponse>
}

const dynamodbClient = new DynamoDBClient({
  region: 'us-east-1',
  maxAttempts: 5,
})

const m2SystemRequestVehicleAnalysis: SQSController = async (message) => {
  logger.debug({
    message: 'Start on send request vehicle analysis to m2 system',
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

  const message_body = message.body as M2SystemRequestVehicleAnalysis

  for (const [key, validate_body] of Object.entries(message_body)) {
    const company_vehicle_config = key as CompanyRequestVehicleConfigEnum
    if (company_vehicle_config === CompanyRequestVehicleConfigEnum.ETHICAL) {
      const body = validateEthicalBody(validate_body as M2SystemEthicalAnalysisConstructorResponse)

      const m2_request_vehicle_analysis = await m2RequestAnalysisVehicle({
        body: body.data,
      })

      const request_vehicle = await getRequestVehicleAdapter({
        dynamodbClient,
        vehicle_id,
        request_id,
      })

      await updateRequestVehicleAdapter({
        m2_request_vehicle_analysis,
        request_vehicle,
        dynamodbClient,
      })
    } else if (company_vehicle_config === CompanyRequestVehicleConfigEnum.PLATE_HISTORY) {
      const body = validatePlateHistoryBody(validate_body as M2SystemPlateHistoryAnalysisConstructorResponse[])

      for (const item of body) {
        const m2_request_vehicle_analysis = await m2RequestAnalysisVehiclePlateHistory({
          body: item.data,
        })

        const request_vehicle = await getRequestVehicleAdapter({
          dynamodbClient,
          vehicle_id,
          request_id,
        })

        await updateRequestVehicleAdapter({
          m2_request_vehicle_analysis,
          request_vehicle,
          dynamodbClient,
        })
      }
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
    message: 'Finish on send request vehicle analysis to m2 system',
    vehicle_id,
    request_id,
  })

  return {
    success: true,
    statusCode: 200,
  }
}

export default m2SystemRequestVehicleAnalysis

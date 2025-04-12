import { DynamoDBClient } from '@aws-sdk/client-dynamodb'

import { SQSController } from '~/models/lambda'
import useCaseValidateVehicleAnalysis, { UseCaseValidateVehicleAnalysisParams } from '~/use-cases/validate-vehicle-analysis'
import logger from '~/utils/logger'

import validateBody from './validate-body'

export type ValidateVehicleAnalysisWorkerMessageBody = Omit<UseCaseValidateVehicleAnalysisParams, 'dynamodbClient'>

const dynamodbClient = new DynamoDBClient({
  region: 'us-east-1',
  maxAttempts: 5,
})

const validateVehicleAnalysisWorker: SQSController = async (message) => {
  logger.debug({
    message: 'Start on validate vehicle analysis',
  })

  const body = validateBody((message.body as ValidateVehicleAnalysisWorkerMessageBody))

  const validate_vehicle_analysis_params: UseCaseValidateVehicleAnalysisParams = {
    ...body,
    dynamodbClient,
  }

  await useCaseValidateVehicleAnalysis(validate_vehicle_analysis_params)

  logger.info({
    message: 'Finish on validate request vehicle analysis from eagle system response',
    vehicle_id: body.vehicle_id,
    request_id: body.request_id,
  })

  return {
    success: true,
    statusCode: 200,
  }
}

export default validateVehicleAnalysisWorker

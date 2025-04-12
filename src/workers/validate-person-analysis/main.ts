import { DynamoDBClient } from '@aws-sdk/client-dynamodb'

import { SQSController } from '~/models/lambda'
import useCaseValidatePersonAnalysis, { UseCaseValidatePersonAnalysisParams } from '~/use-cases/validate-person-analysis'
import logger from '~/utils/logger'

import validateBody from './validate-body'

export type ValidatePersonAnalysisWorkerMessageBody = Omit<UseCaseValidatePersonAnalysisParams, 'dynamodbClient'>

const dynamodbClient = new DynamoDBClient({
  region: 'us-east-1',
  maxAttempts: 5,
})

const validatePersonAnalysisWorker: SQSController = async (message) => {
  logger.debug({
    message: 'Start on validate person analysis',
  })

  const body = validateBody((message.body as ValidatePersonAnalysisWorkerMessageBody))

  const validate_person_analysis_params: UseCaseValidatePersonAnalysisParams = {
    ...body,
    dynamodbClient,
  }

  await useCaseValidatePersonAnalysis(validate_person_analysis_params)

  logger.info({
    message: 'Finish on validate request person analysis from eagle system response',
    person_id: body.person_id,
    request_id: body.request_id,
  })

  return {
    success: true,
    statusCode: 200,
  }
}

export default validatePersonAnalysisWorker

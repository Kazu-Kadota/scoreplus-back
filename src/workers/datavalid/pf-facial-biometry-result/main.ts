import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { SQSRecord } from 'aws-lambda'

import ErrorHandler from 'src/utils/error-handler'
import logger from 'src/utils/logger'

import sendAnalysisAdapter, { sendAnalysisAdapterParams } from './send-analysis-adapter'
import updateRequestPersonStatusAdapter from './update-request-person-status-adapter'
import validatePFFacialBiometryResult from './validate-body'
import verifyResult from './verify-result'

const dynamodbClient = new DynamoDBClient({
  region: 'us-east-1',
  maxAttempts: 5,
})

const pfFacialBiometryResult = async (record: SQSRecord): Promise<void> => {
  const body = validatePFFacialBiometryResult(JSON.parse(record.body))
  const message_attributes = record.messageAttributes

  const result = verifyResult(body)

  const request_id = message_attributes.request_id.stringValue
  const person_id = message_attributes.person_id.stringValue

  if (!request_id) {
    logger.warn({
      message: 'Not informed request ids to message attributes',
      message_attributes,
    })

    throw new ErrorHandler('Not informed request ids to message attributes', 400)
  }

  if (!person_id) {
    logger.warn({
      message: 'Not informed person_id to message attributes',
      message_attributes,
    })

    throw new ErrorHandler('Not informed person_id to message attributes', 400)
  }

  await updateRequestPersonStatusAdapter(person_id, request_id, result.approved, dynamodbClient)

  if (result.reproved_data) {
    const send_analysis_adapter_params: sendAnalysisAdapterParams = {
      rejected_info: JSON.stringify(result.reproved_data),
      person_id,
      request_id,
    }

    await sendAnalysisAdapter(send_analysis_adapter_params)
  }

  logger.info({
    message: 'Finish on process face biometry result',
    person_id,
  })
}

export default pfFacialBiometryResult

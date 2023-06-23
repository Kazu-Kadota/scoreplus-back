import { SQSRecord } from 'aws-lambda'

import ErrorHandler from 'src/utils/error-handler'

import logger from 'src/utils/logger'

import sendAnalysisAdapter, { sendAnalysisAdapterParams } from './send-analysis-adapter'
import validatePFFacialBiometryResult from './validate-body'
import verifyResult from './verify-result'

const pfFacialBiometryResult = async (record: SQSRecord): Promise<void> => {
  const body = validatePFFacialBiometryResult(JSON.parse(record.body))
  const person_id = record.messageId
  const message_attributes = record.messageAttributes

  const result = verifyResult(body)

  const request_id = message_attributes.request_id.stringValue

  if (!request_id) {
    logger.warn({
      message: 'Not informed request ids to message attributes',
      message_attributes,
    })

    throw new ErrorHandler('Not informed request ids to message attributes', 400)
  }

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

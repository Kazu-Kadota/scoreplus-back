import { MessageAttributeValue, SQSClient } from '@aws-sdk/client-sqs'

import sendMessageAnswerVehicleAnalysis, { SendMessageAnswerVehicleAnalysis } from '~/services/aws/sqs/answer-vehicle-analysis/send'
import logger from '~/utils/logger'
import { ValidateVehicleAnalysisWorkerMessageBody } from '~/workers/validate-vehicle-analysis/main'

export type SendAnswerAnalysisMessageParams = ValidateVehicleAnalysisWorkerMessageBody & {
  sqsClient: SQSClient
}

const sendAnswerAnalysisMessage = async ({
  vehicle_id,
  request_id,
  sqsClient,
  validation_user_id,
  validations_body,
}: SendAnswerAnalysisMessageParams) => {
  const message_attributes: Record<string, MessageAttributeValue> = {
    origin: {
      DataType: 'String',
      StringValue: 'scoreplus',
    },
    vehicle_id: {
      DataType: 'String',
      StringValue: vehicle_id,
    },
    request_id: {
      DataType: 'String',
      StringValue: request_id,
    },
    requestId: {
      DataType: 'String',
      StringValue: logger.config.requestId,
    },
  }

  const send_message_params: SendMessageAnswerVehicleAnalysis = {
    message: JSON.stringify({
      vehicle_id,
      request_id,
      validations_body,
      validation_user_id,
    }),
    message_attributes,
  }

  await sendMessageAnswerVehicleAnalysis(send_message_params, sqsClient)
}

export default sendAnswerAnalysisMessage

import { MessageAttributeValue, SQSClient } from '@aws-sdk/client-sqs'

import sendMessageAnswerVehicleAnalysis, { SendMessageAnswerVehicleAnalysis } from '~/services/aws/sqs/answer-vehicle-analysis/send'
import logger from '~/utils/logger'
import { AnswerVehicleAnalysisWorkerMessageBody } from '~/workers/answer-vehicle-analysis/main'

export type SendAnswerAnalysisMessageParams = AnswerVehicleAnalysisWorkerMessageBody & {
  sqsClient: SQSClient
}

const sendAnswerAnalysisMessage = async ({
  answers_body,
  vehicle_id,
  request_id,
  sqsClient,
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
      answers_body,
      vehicle_id,
      request_id,
    }),
    message_attributes,
  }

  await sendMessageAnswerVehicleAnalysis(send_message_params, sqsClient)
}

export default sendAnswerAnalysisMessage

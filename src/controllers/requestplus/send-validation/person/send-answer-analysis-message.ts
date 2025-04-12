import { MessageAttributeValue, SQSClient } from '@aws-sdk/client-sqs'

import sendMessageAnswerPersonAnalysis, { SendMessageAnswerPersonAnalysis } from '~/services/aws/sqs/answer-person-analysis/send'
import logger from '~/utils/logger'
import { ValidatePersonAnalysisWorkerMessageBody } from '~/workers/validate-person-analysis/main'

export type SendAnswerAnalysisMessageParams = ValidatePersonAnalysisWorkerMessageBody & {
  sqsClient: SQSClient
}

const sendAnswerAnalysisMessage = async ({
  person_id,
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
    person_id: {
      DataType: 'String',
      StringValue: person_id,
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

  const send_message_params: SendMessageAnswerPersonAnalysis = {
    message: JSON.stringify({
      person_id,
      request_id,
      validations_body,
      validation_user_id,
    }),
    message_attributes,
  }

  await sendMessageAnswerPersonAnalysis(send_message_params, sqsClient)
}

export default sendAnswerAnalysisMessage

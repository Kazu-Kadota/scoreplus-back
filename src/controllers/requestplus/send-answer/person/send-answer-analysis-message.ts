import { MessageAttributeValue, SQSClient } from '@aws-sdk/client-sqs'

import sendMessageAnswerPersonAnalysis, { SendMessageAnswerPersonAnalysis } from '~/services/aws/sqs/answer-person-analysis/send'
import logger from '~/utils/logger'
import { AnswerPersonAnalysisWorkerMessageBody } from '~/workers/answer-person-analysis/main'

export type SendAnswerAnalysisMessageParams = AnswerPersonAnalysisWorkerMessageBody & {
  sqsClient: SQSClient
}

const sendAnswerAnalysisMessage = async ({
  answers_body,
  person_id,
  request_id,
  sqsClient,
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
      answers_body,
      person_id,
      request_id,
    }),
    message_attributes,
  }

  await sendMessageAnswerPersonAnalysis(send_message_params, sqsClient)
}

export default sendAnswerAnalysisMessage

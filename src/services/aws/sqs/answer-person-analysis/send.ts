import { MessageAttributeValue, SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs'

import ErrorHandler from '~/utils/error-handler'
import getStringEnv from '~/utils/get-string-env'
import logger from '~/utils/logger'

const SQS_ANSWER_PERSON_ANALYSIS = getStringEnv('SQS_ANSWER_PERSON_ANALYSIS')

export type SendMessageAnswerPersonAnalysis = {
  message: string
  message_attributes: Record<string, MessageAttributeValue>
}

const sendMessageAnswerPersonAnalysis = async (params: SendMessageAnswerPersonAnalysis, sqsClient: SQSClient) => {
  logger.debug({
    message: 'SQS: SendMessage',
    queue: SQS_ANSWER_PERSON_ANALYSIS,
  })

  const command = new SendMessageCommand({
    MessageBody: params.message,
    QueueUrl: SQS_ANSWER_PERSON_ANALYSIS,
    MessageAttributes: params.message_attributes,
    MessageGroupId: params.message_attributes.request_id.StringValue,
  })

  await sqsClient
    .send(command)
    .catch((err) => {
      logger.error({
        message: 'Error on send answer person analysis',
        err,
      })

      throw new ErrorHandler('Error on send answer person analysis', 500)
    })
}

export default sendMessageAnswerPersonAnalysis

import { MessageAttributeValue, SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs'

import ErrorHandler from '~/utils/error-handler'
import getStringEnv from '~/utils/get-string-env'
import logger from '~/utils/logger'

const SQS_DATAVALID_FACIAL = getStringEnv('SQS_DATAVALID_FACIAL')

export type SendMessageDatavalidFacial = {
  message: string
  message_attributes: Record<string, MessageAttributeValue>
  message_group_id: string
}

const sendMessageDatavalidFacial = async (params: SendMessageDatavalidFacial, sqsClient: SQSClient) => {
  logger.debug({
    message: 'SQS: SendMessage',
    message_group_id: params.message_group_id,
  })

  const command = new SendMessageCommand({
    MessageBody: params.message,
    QueueUrl: SQS_DATAVALID_FACIAL,
    MessageAttributes: params.message_attributes,
    MessageGroupId: params.message_group_id,
  })

  await sqsClient
    .send(command)
    .catch((err) => {
      logger.error({
        message: 'Error on send person to biometry analysis',
        err,
      })

      throw new ErrorHandler('Error on send person to biometry analysis', 500)
    })
}

export default sendMessageDatavalidFacial

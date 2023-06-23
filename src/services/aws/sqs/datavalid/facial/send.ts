import { MessageAttributeValue, SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs'
import getStringEnv from 'src/utils/get-string-env'
import logger from 'src/utils/logger'

const SQS_DATAVALID_FACIAL = getStringEnv('SQS_DATAVALID_FACIAL')

export interface sendMessageParams {
  message: string
  message_attributes: Record<string, MessageAttributeValue>
  message_group_id: string
}

const sendMessage = async (params: sendMessageParams, sqsClient: SQSClient) => {
  logger.debug({
    message: 'Sending data to SQS',
    message_group_id: params.message_group_id,
  })

  const command = new SendMessageCommand({
    MessageBody: params.message,
    QueueUrl: SQS_DATAVALID_FACIAL,
    MessageAttributes: params.message_attributes,
    MessageGroupId: params.message_group_id,
  })

  await sqsClient.send(command)
}

export default sendMessage

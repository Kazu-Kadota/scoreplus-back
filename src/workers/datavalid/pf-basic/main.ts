import { DynamoDBClient } from '@aws-sdk/client-dynamodb'

import { PFBasicBiometryBody } from '~/models/datavalid/pf-basic/request-body'
import { DatavalidSQSReceivedMessageAttributes } from '~/models/datavalid/sqs-message-attributes'
import { SQSController } from '~/models/lambda'
import serproDatavalidV3ValidatePfBasica from '~/services/serpro/datavalid/v3/validate/pf-basica'
import InternalServerError from '~/utils/errors/500-internal-server-error'
import logger from '~/utils/logger'

import validateBody from './validate-body'
import datavalidVerifyResultPfBasic from './verify-result/main'

export type DatavalidSendRequestPfBasicMessageBody = {
  'biometry-basic': PFBasicBiometryBody
}

const dynamodbClient = new DynamoDBClient({
  region: 'us-east-1',
  maxAttempts: 5,
})

const datavalidSendRequestPfBasic: SQSController<DatavalidSQSReceivedMessageAttributes> = async (message) => {
  logger.debug({
    message: 'Start on verify send request pf-basic',
  })
  const body = validateBody((message.body as DatavalidSendRequestPfBasicMessageBody)['biometry-basic'] as PFBasicBiometryBody)

  const request_id = message.message_attributes.request_id.stringValue
  const person_id = message.message_attributes.person_id.stringValue

  if (!request_id) {
    logger.warn({
      message: 'Not informed request_id in message_attributes',
      ...message,
    })

    throw new InternalServerError('Not informed request ids in message attributes')
  }

  if (!person_id) {
    logger.warn({
      message: 'Not informed person_id in message attributes',
      ...message,
    })

    throw new InternalServerError('Not informed person_id in message attributes')
  }

  const datavalid_result = await serproDatavalidV3ValidatePfBasica({ body })

  await datavalidVerifyResultPfBasic({
    datavalid_result,
    dynamodbClient,
    person_id,
    request_id,
  })

  logger.info({
    message: 'Finish on verify result pf-facial',
    person_id,
  })

  return {
    success: true,
    statusCode: 200,
  }
}

export default datavalidSendRequestPfBasic

import { S3Client } from '@aws-sdk/client-s3'
import { SQSClient } from '@aws-sdk/client-sqs'

import { mockDatavalidPfBasicResponse } from 'src/mock/datavalid/pf-basic/response'

import { PFBasicBiometryBody } from '~/models/datavalid/pf-basic/request-body'
import { DatavalidSQSReceivedMessageAttributes } from '~/models/datavalid/sqs-message-attributes'
import { SQSController } from '~/models/lambda'
import serproDatavalidV3ValidatePfBasica from '~/services/serpro/datavalid/v3/validate/pf-basica'
import InternalServerError from '~/utils/errors/500-internal-server-error'
import getStringEnv from '~/utils/get-string-env'
import logger from '~/utils/logger'

import validateBody from './validate-body'
import datavalidVerifyResultPfBasic from './verify-result/main'

export type DatavalidSendRequestPfBasicMessageBody = {
  'biometry-basic': PFBasicBiometryBody
}

const sqsClient = new SQSClient({
  region: 'us-east-1',
  maxAttempts: 5,
})

const s3Client = new S3Client({
  region: 'us-east-1',
  maxAttempts: 5,
})

const STAGE = getStringEnv('STAGE')
const REQUEST_INFORMATION_THIRD_PARTY = getStringEnv('REQUEST_INFORMATION_THIRD_PARTY')

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

  const get_response_datavalid = STAGE === 'prd' || REQUEST_INFORMATION_THIRD_PARTY === 'true'

  const datavalid_result = get_response_datavalid
    ? await serproDatavalidV3ValidatePfBasica({ body })
    : mockDatavalidPfBasicResponse

  await datavalidVerifyResultPfBasic({
    datavalid_result,
    person_id,
    request_id,
    s3Client,
    sqsClient,
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

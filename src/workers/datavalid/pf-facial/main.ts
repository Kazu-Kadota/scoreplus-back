import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { S3Client } from '@aws-sdk/client-s3'

import { ImageAnswerFormato } from '~/models/datavalid/image-answer'
import { PFFacialBiometrySendRequestBody } from '~/models/datavalid/pf-facial/request-body'
import { DatavalidSQSReceivedMessageAttributes } from '~/models/datavalid/sqs-message-attributes'
import { SQSController } from '~/models/lambda'
import InternalServerError from '~/utils/errors/500-internal-server-error'
import logger from '~/utils/logger'

import getFacialImageAdapter from './get-facial-image-adapter'
import sendValidationAdapter from './send-validation-adapter'
import validateBody from './validate-body'
import datavalidVerifyResultPfFacial from './verify-result/main'

export type DatavalidSendRequestPfFacialMessageBody = {
  'biometry-facial': PFFacialBiometrySendRequestBody
}

const dynamodbClient = new DynamoDBClient({
  region: 'us-east-1',
  maxAttempts: 5,
})

const s3Client = new S3Client({
  region: 'us-east-1',
  maxAttempts: 5,
})

const datavalidSendRequestPfFacial: SQSController<DatavalidSQSReceivedMessageAttributes> = async (message) => {
  logger.debug({
    message: 'Start on verify send request pf-facial',
    sqs_message: message,
  })
  const body = validateBody((message.body as DatavalidSendRequestPfFacialMessageBody)['biometry-facial'] as PFFacialBiometrySendRequestBody)

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

  const image_base64 = await getFacialImageAdapter({
    key: body.answer.biometria_face.s3_image_path,
    s3Client,
  })

  const image_type_arr = body.answer.biometria_face.s3_image_path.split('.')
  const image_type = image_type_arr[image_type_arr.length - 1] as ImageAnswerFormato

  const datavalid_result = await sendValidationAdapter({
    body,
    image_base64,
    image_type,
  })

  await datavalidVerifyResultPfFacial({
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

export default datavalidSendRequestPfFacial

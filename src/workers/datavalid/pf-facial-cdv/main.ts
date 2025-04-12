import { S3Client } from '@aws-sdk/client-s3'
import { SQSClient } from '@aws-sdk/client-sqs'

import { mockDatavalidPfFacialCDVResponse } from 'src/mock/datavalid/pf-facial-cdv/response'

import { FileTypeJpegMap } from '~/constants/file-type'
import { ImageAnswer, ImageAnswerFormato } from '~/models/datavalid/image-answer'
import { PFFacialCDVBiometrySendRequestBody } from '~/models/datavalid/pf-facial-cdv/request-body'
import { DatavalidRequestImage } from '~/models/datavalid/request-image'
import { DatavalidSQSReceivedMessageAttributes } from '~/models/datavalid/sqs-message-attributes'
import { SQSController } from '~/models/lambda'
import InternalServerError from '~/utils/errors/500-internal-server-error'
import getStringEnv from '~/utils/get-string-env'
import logger from '~/utils/logger'

import getImageAdapter from './get-facial-image-adapter'
import sendValidationAdapter from './send-validation-adapter'
import validateBody from './validate-body'
import datavalidVerifyResultPfFacialCDV from './verify-result/main'

export type DatavalidSendRequestPfFacialMessageBody = {
  'biometry-cnh': PFFacialCDVBiometrySendRequestBody
}

const s3Client = new S3Client({
  region: 'us-east-1',
  maxAttempts: 5,
})

const sqsClient = new SQSClient({
  region: 'us-east-1',
  maxAttempts: 5,
})

const STAGE = getStringEnv('STAGE')
const REQUEST_INFORMATION_THIRD_PARTY = getStringEnv('REQUEST_INFORMATION_THIRD_PARTY')

const datavalidSendRequestPfFacialCDV: SQSController<DatavalidSQSReceivedMessageAttributes> = async (message) => {
  logger.debug({
    message: 'Start on verify send request pf-facial-cdv',
  })
  const body = validateBody((message.body as DatavalidSendRequestPfFacialMessageBody)['biometry-cnh'] as PFFacialCDVBiometrySendRequestBody)

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

  const images_map = new Map<string, ImageAnswer>()

  for (const answer of Object.values(body.answer)) {
    if (Object.keys(answer).length === 0) {
      continue
    }

    const image = (answer as unknown) as DatavalidRequestImage
    const image_base64 = await getImageAdapter({
      key: image.s3_image_path,
      s3Client,
    })

    const image_type_arr = image.s3_image_path.split('.')
    const verify_image_type = image_type_arr[image_type_arr.length - 1]

    const image_type = verify_image_type === 'jpeg' || verify_image_type === 'JPEG'
      ? FileTypeJpegMap[verify_image_type] as ImageAnswerFormato
      : verify_image_type as ImageAnswerFormato

    const image_name_arr = image_type_arr[0].split('/')
    const image_name = image_name_arr[image_name_arr.length - 1]

    images_map.set(image_name, {
      base64: image_base64,
      formato: image_type,
    })
  }

  const get_response_datavalid = STAGE === 'prd' || REQUEST_INFORMATION_THIRD_PARTY === 'true'

  const datavalid_result = get_response_datavalid
    ? await sendValidationAdapter({
      body,
      images_map,
    })
    : mockDatavalidPfFacialCDVResponse

  await datavalidVerifyResultPfFacialCDV({
    datavalid_result,
    s3Client,
    sqsClient,
    person_id,
    request_id,
  })

  logger.info({
    message: 'Finish on verify result pf-facial-cdv',
    person_id,
  })

  return {
    success: true,
    statusCode: 200,
  }
}

export default datavalidSendRequestPfFacialCDV

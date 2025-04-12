import { DynamoDBClient } from '@aws-sdk/client-dynamodb'

import { CompanyRequestPersonConfigEnum } from '~/models/dynamo/enums/company'
import { EagleSystemRequestAnalysisPersonParams } from '~/models/eagle/request/analysis-person'
import { SQSController } from '~/models/lambda'
import eagleRequestAnalysisPerson from '~/services/eagle/request/analysis-person'
import InternalServerError from '~/utils/errors/500-internal-server-error'
import logger from '~/utils/logger'

import getRequestPersonAdapter from './get-request-person-adapter'
import updateRequestPersonAdapter from './update-request-person-adapter'
import validateBody from './validate-body'

export type EagleSystemRequestPersonAnalysis = {
  [CompanyRequestPersonConfigEnum.BASIC_DATA]?: EagleSystemRequestAnalysisPersonParams
  [CompanyRequestPersonConfigEnum.PROCESS]?: EagleSystemRequestAnalysisPersonParams
  [CompanyRequestPersonConfigEnum.CNH_SIMPLE]?: EagleSystemRequestAnalysisPersonParams
  [CompanyRequestPersonConfigEnum.CNH_ADVANCED]?: EagleSystemRequestAnalysisPersonParams
}

const dynamodbClient = new DynamoDBClient({
  region: 'us-east-1',
  maxAttempts: 5,
})

const eagleSystemRequestPersonAnalysis: SQSController = async (message) => {
  logger.debug({
    message: 'Start on send request person analysis to eagle system',
  })

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

  const message_body = message.body as EagleSystemRequestPersonAnalysis

  for (const validate_body of Object.values(message_body)) {
    const body = validateBody(validate_body)

    const eagle_request_person_analysis = await eagleRequestAnalysisPerson({ body })

    const request_person = await getRequestPersonAdapter({
      dynamodbClient,
      person_id,
      request_id,
    })

    await updateRequestPersonAdapter({
      eagle_request_person_analysis,
      request_person,
      dynamodbClient,
    })
  }

  logger.info({
    message: 'Finish on send request person analysis to eagle system',
    person_id,
    request_id,
  })

  return {
    success: true,
    statusCode: 200,
  }
}

export default eagleSystemRequestPersonAnalysis

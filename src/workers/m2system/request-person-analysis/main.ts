import { DynamoDBClient } from '@aws-sdk/client-dynamodb'

import { CompanyRequestPersonConfigEnum } from '~/models/dynamo/enums/company'
import { SQSController } from '~/models/lambda'
import { M2PersonRequestAnalysisBody } from '~/models/m2system/request/analysis-person'
import m2RequestAnalysisPerson from '~/services/m2/request/analysis-person'
import InternalServerError from '~/utils/errors/500-internal-server-error'
import logger from '~/utils/logger'

import getRequestPersonAdapter from './get-request-person-adapter'
import updateRequestPersonAdapter from './update-request-person-adapter'
import validateBody from './validate-body'

export type M2SystemRequestPersonAnalysis = {
  [CompanyRequestPersonConfigEnum.ETHICAL_COMPLETE]?: M2PersonRequestAnalysisBody
  [CompanyRequestPersonConfigEnum.ETHICAL]?: M2PersonRequestAnalysisBody
  [CompanyRequestPersonConfigEnum.HISTORY]?: M2PersonRequestAnalysisBody
}

const dynamodbClient = new DynamoDBClient({
  region: 'us-east-1',
  maxAttempts: 5,
})

const m2SystemRequestPersonAnalysis: SQSController = async (message) => {
  logger.debug({
    message: 'Start on send request person analysis to m2 system',
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

  const message_body = message.body as M2SystemRequestPersonAnalysis

  for (const validate_body of Object.values(message_body)) {
    const body = validateBody(validate_body)

    const m2_request_person_analysis = await m2RequestAnalysisPerson({ body })

    const request_person = await getRequestPersonAdapter({
      dynamodbClient,
      person_id,
      request_id,
    })

    await updateRequestPersonAdapter({
      m2_request_person_analysis,
      request_person,
      dynamodbClient,
    })
  }

  logger.info({
    message: 'Finish on send request person analysis to m2 system',
    person_id,
    request_id,
  })

  return {
    success: true,
    statusCode: 200,
  }
}

export default m2SystemRequestPersonAnalysis

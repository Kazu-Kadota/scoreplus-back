import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { S3Client } from '@aws-sdk/client-s3'
import { SQSClient } from '@aws-sdk/client-sqs'

import { Controller } from '~/models/lambda'
import getRequestplusValidateAnalysisPerson from '~/services/aws/dynamo/request/validate/person/get'
import NotFoundError from '~/utils/errors/404-not-found'
import logger from '~/utils/logger'

import validateBody from './validate-body'
import validateBodyMap from './validate-body-map'
import validatePath from './validate-path'
import validateQueryPerson from './validate-query-person'

const dynamoDBClient = new DynamoDBClient({
  region: 'us-east-1',
  maxAttempts: 5,
})

const sqsClient = new SQSClient({
  region: 'us-east-1',
  maxAttempts: 5,
})

const s3Client = new S3Client({
  region: 'us-east-1',
  maxAttempts: 5,
})

const sendValidationPersonController: Controller<true> = async (req) => {
  logger.debug({
    message: 'Start to send validation person analysis',
  })

  const body = validateBody(JSON.parse(req.body as string))
  const { person_id } = validatePath({ ...req.pathParameters })
  const { request_id } = validateQueryPerson({ ...req.queryStringParameters })

  const validate_person = await getRequestplusValidateAnalysisPerson({
    person_id,
    request_id,
  }, dynamoDBClient)

  if (!validate_person) {
    logger.warn({
      message: 'Person to validate not found',
      person_id,
      request_id,
    })

    throw new NotFoundError('Pessoa não existe para ser validado')
  }

  await Promise.all(body.map((validate) => validateBodyMap({
    person_id,
    reason: validate.reason,
    region: validate.region,
    request_id,
    result: validate.result,
    s3Client,
    sqsClient,
    type: validate.type,
    validation_user_id: req.user.user_id,
  })))

  logger.info({
    message: 'Person validate queued successfully',
    person_id,
  })

  return {
    body: {
      message: 'Person validate queued successfully',
      person_id,
    },
  }
}

export default sendValidationPersonController

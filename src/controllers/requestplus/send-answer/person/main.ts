import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { S3Client } from '@aws-sdk/client-s3'
import { SQSClient } from '@aws-sdk/client-sqs'

import { Controller } from '~/models/lambda'
import getRequestplusAnalysisPerson from '~/services/aws/dynamo/request/analysis/person/get'
import NotFoundError from '~/utils/errors/404-not-found'
import logger from '~/utils/logger'

import answerBodyMap from './answer-body-map'
import { SendAnswerAnalysisMessageParams } from './send-answer-analysis-message'
import validateBody from './validate-body'
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

const sendAnswerPersonController: Controller<true> = async (req) => {
  logger.debug({
    message: 'Start to send answer person analysis',
  })

  const body = validateBody(JSON.parse(req.body as string))
  const { person_id } = validatePath({ ...req.pathParameters })
  const { request_id } = validateQueryPerson({ ...req.queryStringParameters })

  const data: SendAnswerAnalysisMessageParams = {
    answers_body: body,
    person_id,
    request_id,
    sqsClient,
  }

  const request_person = await getRequestplusAnalysisPerson({
    person_id,
    request_id,
  }, dynamoDBClient)

  if (!request_person) {
    logger.warn({
      message: 'Person to answer not found',
      person_id,
      request_id,
    })

    throw new NotFoundError('Pessoa não existe para ser respondido')
  }

  await Promise.all(body.map((answer) => answerBodyMap({
    person_id,
    reason: answer.reason,
    region: answer.region,
    request_id,
    s3Client,
    sqsClient,
    type: answer.type,
  })))

  logger.info({
    message: 'Person answer queued successfully',
    person_id: data.person_id,
  })

  return {
    body: {
      message: 'Person answer queued successfully',
      person_id: data.person_id,
    },
  }
}

export default sendAnswerPersonController

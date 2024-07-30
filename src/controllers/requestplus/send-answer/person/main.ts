import { DynamoDBClient } from '@aws-sdk/client-dynamodb'

import { Controller } from '~/models/lambda'
import useCaseSendPersonAnswer, { UseCaseSendPersonAnswerParams } from '~/use-cases/answer-person-analysis'
import logger from '~/utils/logger'

import validateBody from './validate-body'
import validatePath from './validate-path'
import validateQueryPerson from './validate-query-person'

const dynamodbClient = new DynamoDBClient({ region: 'us-east-1' })

const sendAnswerPersonController: Controller<true> = async (req) => {
  logger.debug({
    message: 'Start to send answer person analysis',
  })

  const body = validateBody(JSON.parse(req.body as string))
  const { person_id } = validatePath({ ...req.pathParameters })
  const { request_id } = validateQueryPerson({ ...req.queryStringParameters })

  const data: UseCaseSendPersonAnswerParams = {
    request_id,
    answers_body: body,
    dynamodbClient,
    person_id,
  }

  await useCaseSendPersonAnswer(data)

  logger.info({
    message: 'Person answer registered successfully',
    person_id: data.person_id,
  })

  return {
    body: {
      message: 'Person answer registered successfully',
      person_id: data.person_id,
    },
  }
}

export default sendAnswerPersonController

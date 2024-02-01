import { DynamoDBClient } from '@aws-sdk/client-dynamodb'

import { Controller } from '~/models/lambda'
import logger from '~/utils/logger'

import sendPersonAnswer, { SendPersonAnswerParams } from './send-person-answer'
import validateBody from './validate-body'
import validatePath from './validate-path'
import validateQueryPerson from './validate-query-person'

const dynamodbClient = new DynamoDBClient({ region: 'us-east-1' })

const sendAnswerPersonController: Controller<true> = async (req) => {
  logger.debug({
    message: 'Start to send answer person analysis',
  })

  const body = validateBody(JSON.parse(req.body as string))
  const { id } = validatePath({ ...req.pathParameters })
  const { person_id } = validateQueryPerson({ ...req.queryStringParameters })

  const data: SendPersonAnswerParams = {
    request_id: id,
    answers_body: body,
    dynamodbClient,
    person_id,
  }

  await sendPersonAnswer(data)

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

import { DynamoDBClient } from '@aws-sdk/client-dynamodb'

import { Controller } from '~/models/lambda'
import logger from '~/utils/logger'

import queryRequestPersonByIdAdapter from './query-request-person-by-id-adapter'
import validatePersonParam from './validate-param'

const dynamodbClient = new DynamoDBClient({ region: 'us-east-1' })

const queryPersonByIdController: Controller<true> = async (req) => {
  logger.debug({
    message: 'Start query person by id',
  })

  const { person_id } = validatePersonParam({ ...req.pathParameters })

  const user_info = req.user

  const request_person = await queryRequestPersonByIdAdapter(person_id, user_info, dynamodbClient)

  logger.info({
    message: 'Finish on get person request info',
    person: request_person,
  })

  return {
    body: {
      message: 'Finish on get person request info',
      person: request_person,
    },
  }
}

export default queryPersonByIdController

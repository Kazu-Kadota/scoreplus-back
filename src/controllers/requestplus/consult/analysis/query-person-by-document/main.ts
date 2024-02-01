import { DynamoDBClient } from '@aws-sdk/client-dynamodb'

import { Controller } from '~/models/lambda'
import logger from '~/utils/logger'

import queryRequestPersonByDocumentAdapter from './query-request-person-by-document-adapter'
import validateQuery from './validate-query'

const dynamodbClient = new DynamoDBClient({ region: 'us-east-1' })

const queryPersonByDocumentController: Controller<true> = async (req) => {
  logger.debug({
    message: 'Start query person analysis by document',
  })

  const user_info = req.user
  const query_person = validateQuery({ ...req.queryStringParameters })

  const data = await queryRequestPersonByDocumentAdapter(query_person, dynamodbClient, user_info)

  logger.info({
    message: 'Finish on query person analysis by document',
  })

  return {
    body: {
      message: 'Finish on get person analysis by document',
      data,
    },
  }
}

export default queryPersonByDocumentController

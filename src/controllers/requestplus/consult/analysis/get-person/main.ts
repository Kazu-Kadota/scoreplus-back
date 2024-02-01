import { DynamoDBClient } from '@aws-sdk/client-dynamodb'

import { Controller } from '~/models/lambda'
import logger from '~/utils/logger'

import getRequestPersonAdapter, { GetRequestPersonAdapterParams } from './get-request-person-adapter'
import validatePersonParam from './validate-param'
import validatePersonQuery from './validate-query'

const dynamodbClient = new DynamoDBClient({ region: 'us-east-1' })

const getPersonController: Controller<true> = async (req) => {
  logger.debug({
    message: 'Start get person request info',
  })

  const { person_id } = validatePersonParam({ ...req.pathParameters })
  const { request_id } = validatePersonQuery({ ...req.queryStringParameters })

  const user_info = req.user

  const get_request_person_adapter_params: GetRequestPersonAdapterParams = {
    dynamodbClient,
    person_id,
    request_id,
    user_info,
  }

  const request_person = await getRequestPersonAdapter(get_request_person_adapter_params)

  logger.info({
    message: 'Finish on get person request info',
    request_id,
    person_id,
  })

  return {
    body: {
      message: 'Finish on get request person',
      person: request_person,
    },
  }
}

export default getPersonController

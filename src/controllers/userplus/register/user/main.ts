import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { v4 as uuid } from 'uuid'

import { UserplusUserBody } from '~/models/dynamo/userplus/user'
import { Controller } from '~/models/lambda'
import putUserplusUser from '~/services/aws/dynamo/user/user/put'
import { QueryByEmailQuery } from '~/services/aws/dynamo/user/user/query-by-email'
import logger from '~/utils/logger'

import getCompanyByNameAdapter from './get-company-adapter'
import hashPassword from './hash-password'
import validateRegister from './validate'
import verifyExistentEmail from './verify-existent-email'

const dynamodbClient = new DynamoDBClient({ region: 'us-east-1' })

const registerUser: Controller<true> = async (req) => {
  logger.debug({
    message: 'Start register user path',
  })

  const body = validateRegister(JSON.parse(req.body as string))

  const user: UserplusUserBody = {
    ...body,
    company_id: '',
  }

  const query_by_email: QueryByEmailQuery = {
    email: body.email,
  }

  await verifyExistentEmail(query_by_email, dynamodbClient)

  const company = await getCompanyByNameAdapter(body.company_name, dynamodbClient)

  user.company_id = company.company_id

  const key = {
    user_id: uuid(),
  }

  user.password = hashPassword(body.password)

  await putUserplusUser(key, user, dynamodbClient)

  logger.info({
    message: 'User registered successfully',
    email: body.email,
  })

  return {
    body: {
      message: 'User registered successfully',
      email: body.email,
    },
  }
}

export default registerUser

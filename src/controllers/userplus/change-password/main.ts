import { DynamoDBClient } from '@aws-sdk/client-dynamodb'

import { UserplusUserKey } from '~/models/dynamo/userplus/user'
import { Controller } from '~/models/lambda'
import logger from '~/utils/logger'

import getUserAdapter from './get-user-adapter'
import updatePassword from './update-password'
import validateBody from './validate'
import validatePassword from './validate-password'

const dynamodbClient = new DynamoDBClient({ region: 'us-east-1' })

const changePasswordController: Controller<true> = async (req) => {
  logger.debug({
    message: 'Start get vehicle request info',
  })
  const user_id = req.user.user_id

  const { old_password, password } = validateBody(JSON.parse(req.body as string))

  const user_key: UserplusUserKey = {
    user_id,
  }

  const user = await getUserAdapter(user_key, dynamodbClient)

  validatePassword(user, old_password)

  await updatePassword({
    dynamodbClient,
    password,
    user_key,
  })

  logger.info({
    message: 'Password changed successfully',
    user_id,
  })

  return {
    body: {
      message: 'Password changed successfully',
      user_id,
    },
  }
}

export default changePasswordController

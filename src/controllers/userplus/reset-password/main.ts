import { DynamoDBClient } from '@aws-sdk/client-dynamodb'

import { UserplusPasswordHistoryBody, UserplusPasswordHistoryKey } from '~/models/dynamo/userplus/password-history'
import { UserplusUserBody, UserplusUserKey } from '~/models/dynamo/userplus/user'
import { Controller } from '~/models/lambda'
import putPasswordHistory from '~/services/aws/dynamo/user/password-history/put'
import updateUserplusUser from '~/services/aws/dynamo/user/user/update'
import BadRequestError from '~/utils/errors/400-bad-request'
import logger from '~/utils/logger'

import getUserByEmailAdapter from './get-user-by-email-adapter'
import hashPassword from './hash-password'
import validateBody from './validate-body'
import validateQuery from './validate-query'
import validateRecoveryId from './validate-recovery-id'

const dynamodbClient = new DynamoDBClient({ region: 'us-east-1' })

const resetPasswordController: Controller<false> = async (req) => {
  logger.debug({
    message: 'Start reset password path',
  })

  const body = validateBody(JSON.parse(req.body ?? ''))

  const query = validateQuery({ ...req.queryStringParameters })

  if (body.password !== body.confirm_password) {
    logger.warn({
      message: 'Password and confirm password is different',
    })

    throw new BadRequestError('A confirmação de senha está incorreta', 400)
  }

  const user = await getUserByEmailAdapter(query.email, dynamodbClient)

  await validateRecoveryId(query.recovery_id, user, dynamodbClient)

  const new_password = hashPassword(body.password)

  const password_history_key: UserplusPasswordHistoryKey = {
    user_id: user.user_id,
    created_at: new Date().toISOString(),
  }

  const password_history_body: UserplusPasswordHistoryBody = {
    old_password: user.password,
    new_password,
  }

  await putPasswordHistory(password_history_key, password_history_body, dynamodbClient)

  const update_user_key: UserplusUserKey = {
    user_id: user.user_id,
  }

  const update_user_body: Partial<UserplusUserBody> = {
    password: new_password,
  }

  await updateUserplusUser(update_user_key, update_user_body, dynamodbClient)

  logger.info({
    message: 'Users password reset successfully',
    user_id: user.user_id,
  })

  return {
    body: {
      message: 'Users password reset successfully',
      user_id: user.user_id,
    },
  }
}

export default resetPasswordController

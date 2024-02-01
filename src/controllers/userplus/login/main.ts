import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import jwt, { SignOptions } from 'jsonwebtoken'
import { v4 as uuid } from 'uuid'

import { Controller } from '~/models/lambda'
import { UserFromJwt } from '~/utils/extract-jwt-lambda'
import getStringEnv from '~/utils/get-string-env'
import logger from '~/utils/logger'
import { Without } from '~/utils/types/without'

import getUserByEmailAdapter from './get-user-by-email-adapter'
import validateLogin from './validate'
import validatePassword from './validate-password'

const dynamodbClient = new DynamoDBClient({ region: 'us-east-1' })
const AUTH_ES256_PRIVATE_KEY = getStringEnv('AUTH_ES256_PRIVATE_KEY')

const login: Controller<false> = async (req) => {
  logger.debug({
    message: 'Start login path',
  })

  const { email, password } = validateLogin(JSON.parse(req.body as string))

  const user = await getUserByEmailAdapter(email, dynamodbClient)

  validatePassword(user, password)

  const jwt_id = uuid()

  let expires_seconds

  if (user.api) {
    expires_seconds = 60 * 60 * 24 * 30
  } else {
    expires_seconds = 60 * 60 * 16
  }

  const expires_date = new Date()

  expires_date.setSeconds(expires_date.getSeconds() + expires_seconds)

  const payload: Without<UserFromJwt, 'user_id'> = {
    user_type: user.user_type,
    company_name: user.company_name,
    company_id: user.company_id,
  }

  const private_key = AUTH_ES256_PRIVATE_KEY

  const options: SignOptions = {
    expiresIn: expires_seconds,
    algorithm: 'ES256',
    subject: user.user_id,
    jwtid: jwt_id,
  }

  const jwtToken = jwt.sign(
    payload,
    private_key,
    options,
  )

  logger.info({
    message: 'User logged successfully',
    user_id: user.user_id,
  })

  return {
    body: {
      message: 'User logged successfully',
      user: {
        company_name: user.company_name,
        email: user.email,
        user_type: user.user_type,
      },
      jwtToken,
      expires_date,
    },
  }
}

export default login

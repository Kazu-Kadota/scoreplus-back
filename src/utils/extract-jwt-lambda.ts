import { APIGatewayProxyEventHeaders } from 'aws-lambda'
import jwt, { JwtPayload, VerifyOptions } from 'jsonwebtoken'

import { UserGroupEnum } from '~/models/dynamo/enums/user'
import getStringEnv from '~/utils/get-string-env'

import InvalidTokenError from './errors/498-invalid-token'

const AUTH_ES256_PRIVATE_KEY = getStringEnv('AUTH_ES256_PRIVATE_KEY')

export type UserFromJwt = {
  api: boolean
  email: string
  company_id: string
  company_name: string
  user_first_name: string
  user_id: string,
  user_last_name: string
  user_type: UserGroupEnum,
}

const extractJwtLambda = (headers: APIGatewayProxyEventHeaders): UserFromJwt | undefined => {
  try {
    const { Authorization } = headers

    if (!Authorization) {
      return
    }

    const token = Authorization.split(' ')[1]

    const private_key = AUTH_ES256_PRIVATE_KEY

    const options: VerifyOptions = {
      algorithms: ['ES256'],
    }

    const verify = jwt.verify(
      token,
      private_key,
      options,
    ) as JwtPayload

    const api = verify.api
    const email = verify.email
    const user_first_name = verify.user_first_name
    const user_last_name = verify.user_last_name
    const user_type = verify.user_type as UserGroupEnum
    const user_id = verify.sub as string
    const company_name = verify.company_name as string
    const company_id = verify.company_id as string

    return {
      api,
      email,
      user_first_name,
      user_last_name,
      user_type,
      user_id,
      company_name,
      company_id,
    }
  } catch {
    throw new InvalidTokenError('Error on verify token')
  }
}

export default extractJwtLambda

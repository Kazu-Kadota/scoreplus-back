import { APIGatewayProxyEventHeaders } from 'aws-lambda'
import jwt, { JwtPayload, VerifyOptions } from 'jsonwebtoken'

import { UserGroupEnum } from '~/models/dynamo/enums/user'
import getStringEnv from '~/utils/get-string-env'

import InvalidTokenError from './errors/498-invalid-token'

const AUTH_ES256_PRIVATE_KEY = getStringEnv('AUTH_ES256_PRIVATE_KEY')

export interface UserFromJwt {
  user_type: UserGroupEnum,
  user_id: string,
  company_id: string
  company_name: string
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

    const user_type = verify.user_type as UserGroupEnum
    const user_id = verify.sub as string
    const company_name = verify.company_name as string
    const company_id = verify.company_id as string

    return {
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

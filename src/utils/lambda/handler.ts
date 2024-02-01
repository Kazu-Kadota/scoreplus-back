import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

import catchError from '../catch-error'
import UnauthorizedError from '../errors/401-unauthorized'
import InternalServerError from '../errors/500-internal-server-error'
import extractJwtLambda from '../extract-jwt-lambda'
import logger from '../logger'
import { defaultHeaders } from '~/constants/headers'
import { UserGroupEnum } from '~/models/dynamo/enums/user'
import { Controller, Request } from '~/models/lambda'

namespace LambdaHandlerNameSpace {
  export interface UserAuthentication extends Record<UserGroupEnum, boolean> {}

  export class LambdaHandlerFunction {
    controller: Controller<unknown>
    authentication?: UserAuthentication

    constructor (controller: Controller<unknown>, authentication?: UserAuthentication) {
      this.controller = controller
      this.authentication = authentication
    }

    async handler (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
      try {
        logger.setRequestId(event.requestContext.requestId)

        const request: Request = {
          ...event,
        }

        if (this.authentication) {
          const user = extractJwtLambda(event.headers)

          if (!user) {
            logger.error({
              message: 'User not authenticated',
            })

            throw new UnauthorizedError('User not authenticated')
          }

          logger.setUser(user)

          if (!this.authentication[user.user_type]) {
            logger.error({
              message: 'User not authorized to execute this function',
              user_type: user.user_type,
            })

            throw new InternalServerError()
          }

          (request as Request<true>).user = user
        }

        const result = await this.controller(request)

        return {
          headers: {
            ...defaultHeaders,
            ...result.headers,
          },
          multiValueHeaders: result.multiValueHeaders,
          statusCode: result.statusCode ?? 200,
          body: result.notJsonBody === true ? result.body : JSON.stringify(result.body),
          isBase64Encoded: result.isBase64Encoded,
        }
      } catch (err: any) {
        return catchError(err)
      }
    }
  }
}

export default LambdaHandlerNameSpace

import { APIGatewayProxyEvent, APIGatewayProxyResult, SQSEvent, SQSMessageAttributes } from 'aws-lambda'
import { getBoundary, parse } from 'parse-multipart-data'
import { v4 as uuid } from 'uuid'

import catchError from '../catch-error'
import UnauthorizedError from '../errors/401-unauthorized'
import InternalServerError from '../errors/500-internal-server-error'
import extractJwtLambda from '../extract-jwt-lambda'
import logger from '../logger'
import { defaultHeaders } from '~/constants/headers'
import { UserGroupEnum } from '~/models/dynamo/enums/user'
import { BinaryController, BinaryRequest, Controller, Input, Request, SQSController, SQSControllerMessageAttributes } from '~/models/lambda'

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

  export class BinaryLambdaHandlerFunction {
    controller: BinaryController<unknown>
    authentication?: UserAuthentication

    constructor (controller: BinaryController<unknown>, authentication?: UserAuthentication) {
      this.controller = controller
      this.authentication = authentication
    }

    async handler (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
      try {
        logger.setRequestId(event.requestContext.requestId)

        const request: BinaryRequest = {
          ...event,
          parsed_body: {},
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

          (request as BinaryRequest<true>).user = user
        }

        let body_buffer: Buffer

        if (event.isBase64Encoded) {
          const body_decoded = Buffer.from(event.body as string, 'base64').toString('binary')
          body_buffer = Buffer.from(body_decoded, 'binary')
        } else {
          body_buffer = Buffer.from((event.body as string).toString(), 'binary')
        }

        const content_type = event.headers['Content-Type'] || event.headers['content-type'] as string
        const boundary = getBoundary(content_type)

        const binary_body = parse(body_buffer, boundary)

        request.parsed_body = binary_body.reduce<Record<string, Input>>((prev, curr) => ({
          ...prev,
          [curr.name as string]: curr,
        }), {})

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

  /**
   * This class will handle just one message for each lambda invoke, not a batch
   * of messages. Make sure that in Terraform is set only 1 batch_size
   */
  export class LambdaSQSHandlerFunction<T = SQSMessageAttributes> {
    controller: SQSController<T>

    constructor (controller: SQSController<T>) {
      this.controller = controller
    }

    async handler (event: SQSEvent): Promise<void> {
      for (const record of event.Records) {
        const message_attributes = record.messageAttributes as T & SQSControllerMessageAttributes

        if (!message_attributes.requestId?.stringValue) {
          logger.warn({
            message: 'Lambda requestId is not set from message sender',
          })
        }

        if (!message_attributes.origin?.stringValue) {
          logger.warn({
            message: 'Lambda origin is not set from message sender',
          })
        }

        logger.setRequestId(message_attributes.requestId?.stringValue ?? uuid())

        logger.debug({
          message: 'SQS-LAMBDA: Handling message',
        })

        await this.controller({
          attributes: record.attributes,
          body: JSON.parse(record.body) as unknown,
          message_attributes,
          message_id: record.messageId,
        })
      }
    }
  }
}

export default LambdaHandlerNameSpace

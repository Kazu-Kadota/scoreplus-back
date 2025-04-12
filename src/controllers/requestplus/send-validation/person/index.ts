import { APIGatewayProxyEvent } from 'aws-lambda'

import LambdaHandlerNameSpace from '~/utils/lambda/handler'
import logger from '~/utils/logger'

import sendValidationPersonController from './main'

export const handler = async (event: APIGatewayProxyEvent) => {
  logger.setService('requestplus')
  const allowed_users: LambdaHandlerNameSpace.UserAuthentication = {
    admin: true,
    client: false,
    operator: true,
  }

  const releaseExtract = new LambdaHandlerNameSpace
    .LambdaHandlerFunction(sendValidationPersonController, allowed_users)

  return releaseExtract.handler(event)
}

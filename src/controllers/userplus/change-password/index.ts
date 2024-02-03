import { APIGatewayProxyEvent } from 'aws-lambda'

import LambdaHandlerNameSpace from '~/utils/lambda/handler'
import logger from '~/utils/logger'

import changePasswordController from './main'

export const handler = async (event: APIGatewayProxyEvent) => {
  logger.setService('userplus')
  const allowed_users: LambdaHandlerNameSpace.UserAuthentication = {
    admin: true,
    client: true,
    operator: true,
  }

  const releaseExtract = new LambdaHandlerNameSpace
    .LambdaHandlerFunction(changePasswordController, allowed_users)

  return releaseExtract.handler(event)
}

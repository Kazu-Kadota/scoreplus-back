import { APIGatewayProxyEvent } from 'aws-lambda'
import LambdaHandlerNameSpace from 'src/utils/lambda/handler'
import logger from 'src/utils/logger'

import personReleaseExtractController from './main'

export const handler = async (event: APIGatewayProxyEvent) => {
  logger.setService('requestplus')
  const allowed_users: LambdaHandlerNameSpace.UserAuthentication = {
    admin: true,
    client: true,
    operator: false,
  }

  const releaseExtract = new LambdaHandlerNameSpace
    .LambdaHandlerFunction(personReleaseExtractController, allowed_users)

  return releaseExtract.handler(event)
}

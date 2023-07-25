import { APIGatewayProxyEvent } from 'aws-lambda'
import { Response } from 'src/models/lambda'
import LambdaHandlerNameSpace from 'src/utils/lambda/handler'
import logger from 'src/utils/logger'

import requestAnalysis from './main'

export const handler = async (
  event: APIGatewayProxyEvent,
): Promise<Response<any>> => {
  logger.setService('requestplus')
  const allowed_users: LambdaHandlerNameSpace.UserAuthentication = {
    admin: true,
    client: true,
    operator: false,
  }

  const releaseExtract = new LambdaHandlerNameSpace
    .LambdaHandlerFunction(requestAnalysis, allowed_users)

  return releaseExtract.handler(event)
}

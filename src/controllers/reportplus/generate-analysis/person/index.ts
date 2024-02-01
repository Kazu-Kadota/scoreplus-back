import { APIGatewayProxyEvent } from 'aws-lambda'

import LambdaHandlerNameSpace from '~/utils/lambda/handler'
import logger from '~/utils/logger'

import reportPersonAnalysis from './main'

export const handler = async (event: APIGatewayProxyEvent) => {
  logger.setService('reportplus')
  const allowed_users: LambdaHandlerNameSpace.UserAuthentication = {
    admin: true,
    client: true,
    operator: false,
  }

  const releaseExtract = new LambdaHandlerNameSpace
    .LambdaHandlerFunction(reportPersonAnalysis, allowed_users)

  return releaseExtract.handler(event)
}

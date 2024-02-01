import { APIGatewayProxyEvent } from 'aws-lambda'

import LambdaHandlerNameSpace from '~/utils/lambda/handler'
import logger from '~/utils/logger'

import login from './main'

export const handler = async (event: APIGatewayProxyEvent) => {
  logger.setService('requestplus')

  const releaseExtract = new LambdaHandlerNameSpace
    .LambdaHandlerFunction(login)

  return releaseExtract.handler(event)
}

import { APIGatewayProxyEvent } from 'aws-lambda'

import LambdaHandlerNameSpace from '~/utils/lambda/handler'
import logger from '~/utils/logger'

import recoveryPasswordController from './main'

export const handler = async (event: APIGatewayProxyEvent) => {
  logger.setService('userplus')

  const releaseExtract = new LambdaHandlerNameSpace
    .LambdaHandlerFunction(recoveryPasswordController)

  return releaseExtract.handler(event)
}

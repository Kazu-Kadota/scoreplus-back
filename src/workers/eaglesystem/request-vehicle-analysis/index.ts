import { SQSEvent } from 'aws-lambda'

import { DatavalidSQSReceivedMessageAttributes } from '~/models/datavalid/sqs-message-attributes'
import LambdaHandlerNameSpace from '~/utils/lambda/handler'
import logger from '~/utils/logger'

import eagleSystemRequestVehicleAnalysis from './main'

export const handler = (event: SQSEvent) => {
  logger.setService('requestplus')

  const releaseExtract = new LambdaHandlerNameSpace
    .LambdaSQSHandlerFunction<DatavalidSQSReceivedMessageAttributes>(eagleSystemRequestVehicleAnalysis)

  return releaseExtract.handler(event)
}

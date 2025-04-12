import { SQSEvent } from 'aws-lambda'

import { DatavalidSQSReceivedMessageAttributes } from '~/models/datavalid/sqs-message-attributes'
import LambdaHandlerNameSpace from '~/utils/lambda/handler'
import logger from '~/utils/logger'

import m2SystemRequestPersonAnalysis from './main'

export const handler = (event: SQSEvent) => {
  logger.setService('requestplus')

  const releaseExtract = new LambdaHandlerNameSpace
    .LambdaSQSHandlerFunction<DatavalidSQSReceivedMessageAttributes>(m2SystemRequestPersonAnalysis)

  return releaseExtract.handler(event)
}

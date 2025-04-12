import { SQSEvent } from 'aws-lambda'

import { DatavalidSQSReceivedMessageAttributes } from '~/models/datavalid/sqs-message-attributes'
import LambdaHandlerNameSpace from '~/utils/lambda/handler'
import logger from '~/utils/logger'

import answerPersonAnalysisWorker from './main'

export const handler = (event: SQSEvent) => {
  logger.setService('requestplus')

  const releaseExtract = new LambdaHandlerNameSpace
    .LambdaSQSHandlerFunction<DatavalidSQSReceivedMessageAttributes>(answerPersonAnalysisWorker)

  return releaseExtract.handler(event)
}

import { SQSEvent } from 'aws-lambda'
import { catchErrorWorker } from 'src/utils/catch-error'
import logger from 'src/utils/logger'

import pfFacialBiometryResult from './main'

export const handler = async (event: SQSEvent) => {
  try {
    event.Records.forEach(async (record) => {
      logger.setRequestId(record.messageId)
      logger.debug({
        message: 'Getting facial biometry response from Datavalid',
        person_id: record.messageId,
      })
      await pfFacialBiometryResult(record)
    })
  } catch (err: any) {
    catchErrorWorker(err)
  }
}

import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses'

import { SESSendEmailOptions } from '~/models/ses'
import logger from '~/utils/logger'

const sendEmail = async (
  options: SESSendEmailOptions,
  sesClient: SESClient,
): Promise<undefined> => {
  logger.debug({
    message: 'SES: SendingEmail',
    email: options.destination,
  })

  const command = new SendEmailCommand({
    Destination: {
      ToAddresses: [options.destination],
    },
    Message: {
      Body: {
        Text: {
          Data: options.text,
        },
        Html: {
          Data: options.html,
        },
      },
      Subject: {
        Data: options.subject,
      },
    },
    Source: options.from,
  })

  await sesClient.send(command)

  return undefined
}

export default sendEmail

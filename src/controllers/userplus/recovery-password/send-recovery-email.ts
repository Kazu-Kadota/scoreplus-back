import { SESClient } from '@aws-sdk/client-ses'
import fsPromises from 'fs/promises'
import mustache from 'mustache'
import path from 'path'

import { SESSendEmailOptions } from '~/models/ses'
import sendEmail from '~/services/aws/ses/text-send'
import getStringEnv from '~/utils/get-string-env'

export type SendRecoveryEmailParams = {
  recovery_token: string
  email: string
  date: Date
  sesClient: SESClient
}

const sendRecoveryEmail = async ({
  date,
  email,
  recovery_token,
  sesClient,
}: SendRecoveryEmailParams): Promise<void> => {
  const url = `${getStringEnv('USER_RECOVERY_KEY_URL')}?recovery_id=${recovery_token}&email=${email}`

  const email_data = {
    url,
    expires_date: date.toLocaleString(),
    destination: email,
  }

  const file_path = path.join(__dirname, '..', '..', '..', 'templates', 'recovery-password.mustache')

  const template = await fsPromises.readFile(file_path, 'utf-8')

  const body_html = mustache.render(template.toString(), email_data)

  const send_email: SESSendEmailOptions = {
    destination: email,
    from: getStringEnv('SCOREPLUS_EMAIL'),
    subject: 'Recuperação de Senha - System Score Plus',
    html: body_html,
  }

  await sendEmail(send_email, sesClient)
}

export default sendRecoveryEmail

import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { SESClient } from '@aws-sdk/client-ses'

import { Controller } from '~/models/lambda'
import putUserplusRecoveryPassword from '~/services/aws/dynamo/user/recovery-password/put'
import logger from '~/utils/logger'

import createResetToken from './create-reset-token'
import queryUserByEmailAdapter from './get-user-by-email-adapter'
import sendRecoveryEmail from './send-recovery-email'
import validateBody from './validate'

const dynamodbClient = new DynamoDBClient({ region: 'us-east-1' })
const sesClient = new SESClient({ region: 'us-east-1' })

const recoveryPasswordController: Controller<false> = async (req) => {
  logger.debug({
    message: 'Start recovery password path',
  })

  const { email } = validateBody(JSON.parse(req.body ?? ''))

  const user = await queryUserByEmailAdapter(email, dynamodbClient)

  if (!user) {
    return {
      body: {
        message: 'Recovery password email send',
        email,
      },
    }
  }

  const date = new Date()
  date.setMinutes(date.getMinutes() + 30)
  const expires_date = date.toISOString()

  const recovery_token = createResetToken()

  await putUserplusRecoveryPassword(
    { recovery_id: recovery_token },
    { expires_at: expires_date, user_id: user.user_id },
    dynamodbClient,
  )

  await sendRecoveryEmail({
    date,
    email,
    recovery_token,
    sesClient,
  })

  logger.info({
    message: 'Recovery password email send',
    email,
  })

  return {
    body: {
      message: 'Recovery password email send',
      email,
    },
  }
}

export default recoveryPasswordController

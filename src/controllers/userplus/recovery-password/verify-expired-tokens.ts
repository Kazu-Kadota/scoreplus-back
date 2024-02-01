import { DynamoDBClient } from '@aws-sdk/client-dynamodb'

import { UserplusRecoveryPassword } from '~/models/dynamo/userplus/recovery-password'
import deleteUserplusRecoveryPassword from '~/services/aws/dynamo/user/recovery-password/delete'
import scanUserplusRecoveryPassword, { ScanRecoveryPasswordResponse } from '~/services/aws/dynamo/user/recovery-password/scan'

const verifyExpiredTokens = async (dynamodbClient: DynamoDBClient) => {
  const recovery_password: UserplusRecoveryPassword[] = []
  let last_evaluated_key

  const now = new Date().toISOString()
  do {
    const scan_recovery: ScanRecoveryPasswordResponse | undefined = await scanUserplusRecoveryPassword(dynamodbClient, last_evaluated_key)

    if (scan_recovery?.result) {
      for (const item of scan_recovery.result) {
        recovery_password.push(item)
      }
    }

    last_evaluated_key = scan_recovery?.last_evaluated_key
  } while (last_evaluated_key)

  for (const item of recovery_password) {
    if (item.expires_at < now) {
      await deleteUserplusRecoveryPassword({ recovery_id: item.recovery_id }, dynamodbClient)
    }
  }
}

export default verifyExpiredTokens

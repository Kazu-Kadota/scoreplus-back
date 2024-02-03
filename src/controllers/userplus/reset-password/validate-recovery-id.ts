import { DynamoDBClient } from '@aws-sdk/client-dynamodb'

import { UserplusRecoveryPasswordKey } from '~/models/dynamo/userplus/recovery-password'
import { UserplusUser } from '~/models/dynamo/userplus/user'
import deleteUserplusRecoveryPassword from '~/services/aws/dynamo/user/recovery-password/delete'
import getUserplusRecoveryPassword from '~/services/aws/dynamo/user/recovery-password/get'
import BadRequestError from '~/utils/errors/400-bad-request'
import ForbiddenError from '~/utils/errors/403-forbidden'
import NotFoundError from '~/utils/errors/404-not-found'
import logger from '~/utils/logger'

const validateRecoveryId = async (
  recovery_id: string,
  user: UserplusUser,
  dynamodbClient: DynamoDBClient,
): Promise<void> => {
  const recovery_password_key: UserplusRecoveryPasswordKey = {
    recovery_id,
  }

  const recovery_password = await getUserplusRecoveryPassword({ recovery_id }, dynamodbClient)

  if (!recovery_password) {
    logger.warn({
      message: 'Recovery password not found',
      recovery_id,
    })

    throw new NotFoundError('Restauração de senha não encontrada')
  }

  const now = new Date().toISOString()

  if (now > recovery_password.expires_at) {
    await deleteUserplusRecoveryPassword(recovery_password_key, dynamodbClient)

    logger.warn({
      message: 'Expired recovery password',
      recovery_id,
      expires_at: recovery_password.expires_at,
    })

    throw new ForbiddenError('Solicitação de troca de senha expirada')
  }

  if (recovery_password.user_id !== user.user_id) {
    await deleteUserplusRecoveryPassword(recovery_password_key, dynamodbClient)

    logger.warn({
      message: 'User is not the same requested to recovery password',
      recovery_id,
      requested_user_id: recovery_password.user_id,
      email_user_id: user.user_id,
    })

    throw new BadRequestError('Usuário do email não é o mesmo solicitado para recuperar a senha')
  }
}

export default validateRecoveryId

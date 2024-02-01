import { DynamoDBClient } from '@aws-sdk/client-dynamodb'

import { UserplusUser, UserplusUserKey } from '~/models/dynamo/userplus/user'
import getUserplusUser from '~/services/aws/dynamo/user/user/get'
import NotFoundError from '~/utils/errors/404-not-found'
import logger from '~/utils/logger'

const getUserAdapter = async (
  user_key: UserplusUserKey,
  dynamodbClient: DynamoDBClient,
): Promise<UserplusUser> => {
  const user = await getUserplusUser(user_key, dynamodbClient)

  if (!user) {
    logger.warn({
      message: 'User not found',
    })

    throw new NotFoundError('Usuário não encontrado')
  }

  return user
}

export default getUserAdapter

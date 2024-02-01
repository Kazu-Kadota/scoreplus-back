import { DynamoDBClient } from '@aws-sdk/client-dynamodb'

import { UserplusUser } from '~/models/dynamo/userplus/user'
import queryUserplusUserByEmail, { QueryByEmailQuery } from '~/services/aws/dynamo/user/user/query-by-email'
import NotFoundError from '~/utils/errors/404-not-found'
import logger from '~/utils/logger'

const getUserByEmailAdapter = async (
  email: string,
  dynamodbClient: DynamoDBClient,
): Promise<UserplusUser> => {
  const query: QueryByEmailQuery = {
    email,
  }

  const user = await queryUserplusUserByEmail(query, dynamodbClient)

  if (!user || !user[0]) {
    logger.warn({
      message: 'User not found',
      email,
    })

    throw new NotFoundError('Usuário não encontrado')
  }

  return user[0]
}

export default getUserByEmailAdapter

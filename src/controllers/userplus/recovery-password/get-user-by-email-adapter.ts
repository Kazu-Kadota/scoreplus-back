import { DynamoDBClient } from '@aws-sdk/client-dynamodb'

import { UserplusUser } from '~/models/dynamo/userplus/user'
import queryUserplusUserByEmail, { QueryByEmailQuery } from '~/services/aws/dynamo/user/user/query-by-email'
import logger from '~/utils/logger'

const queryUserByEmailAdapter = async (
  email: string,
  dynamodbClient: DynamoDBClient,
): Promise<UserplusUser | undefined> => {
  const query: QueryByEmailQuery = {
    email,
  }

  const user = await queryUserplusUserByEmail(query, dynamodbClient)

  if (!user || !user[0]) {
    logger.warn({
      message: 'E-mail not found',
      email,
    })

    return undefined
  }

  return user[0]
}

export default queryUserByEmailAdapter

import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { User, UserKey } from 'src/models/dynamo/user'
import getUser from 'src/services/aws/dynamo/user/user/get'
import ErrorHandler from 'src/utils/error-handler'
import logger from 'src/utils/logger'

const getUserAdapter = async (
  user_id: string,
  dynamodbClient: DynamoDBClient,
): Promise<User> => {
  const user_key: UserKey = {
    user_id,
  }

  const user = await getUser(user_key, dynamodbClient)

  if (!user) {
    logger.warn({
      message: 'User not found',
      user_id: user_key.user_id,
    })

    throw new ErrorHandler('Usuário não encontrado', 404)
  }

  return user
}

export default getUserAdapter

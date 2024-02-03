import { DynamoDBClient } from '@aws-sdk/client-dynamodb'

import queryUserplusUserByEmail, { QueryByEmailQuery } from '~/services/aws/dynamo/user/user/query-by-email'
import ConflictError from '~/utils/errors/409-conflict'
import logger from '~/utils/logger'

const verifyExistentEmail = async (query: QueryByEmailQuery, dynamodbClient: DynamoDBClient) => {
  const emailExist = await queryUserplusUserByEmail(query, dynamodbClient)

  if (!emailExist || emailExist.length !== 0) {
    logger.warn({
      message: 'E-mail already exist',
      email: query.email,
    })

    throw new ConflictError('E-mail já existe')
  }
}

export default verifyExistentEmail

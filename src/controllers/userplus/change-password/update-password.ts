import { DynamoDBClient } from '@aws-sdk/client-dynamodb'

import { UserplusUserKey } from '~/models/dynamo/userplus/user'
import updateUserplusUser from '~/services/aws/dynamo/user/user/update'

import hashPassword from './hash-password'

export type UpdatePassword = {
  password: string,
  user_key: UserplusUserKey,
  dynamodbClient: DynamoDBClient
}

const updatePassword = async ({
  password,
  user_key,
  dynamodbClient,
}: UpdatePassword) => {
  const new_password = hashPassword(password)

  const body = {
    password: new_password,
  }

  await updateUserplusUser(user_key, body, dynamodbClient)
}

export default updatePassword

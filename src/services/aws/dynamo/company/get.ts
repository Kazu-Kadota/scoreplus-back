import {
  DynamoDBClient,
  GetItemCommand,
} from '@aws-sdk/client-dynamodb'
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb'

import { UserplusCompany, UserplusCompanyKey } from '~/models/dynamo/userplus/company'
import getStringEnv from '~/utils/get-string-env'
import logger from '~/utils/logger'

const DYNAMO_TABLE_USERPLUS_COMPANY = getStringEnv('DYNAMO_TABLE_USERPLUS_COMPANY')

const getUserplusCompany = async (
  key: UserplusCompanyKey,
  dynamodbClient: DynamoDBClient,
): Promise<UserplusCompany | undefined> => {
  logger.debug({
    message: 'DYNAMODB: GetItem',
    table: DYNAMO_TABLE_USERPLUS_COMPANY,
    ...key,
  })

  const command = new GetItemCommand({
    TableName: DYNAMO_TABLE_USERPLUS_COMPANY,
    Key: marshall(key),
  })

  const result = await dynamodbClient.send(command)

  if (!result.Item) {
    return undefined
  }

  return unmarshall(result.Item) as UserplusCompany
}

export default getUserplusCompany

import {
  DynamoDBClient,
  ScanCommand,
  AttributeValue,
} from '@aws-sdk/client-dynamodb'
import { unmarshall } from '@aws-sdk/util-dynamodb'

import { UserplusCompany } from '~/models/dynamo/userplus/company'
import getStringEnv from '~/utils/get-string-env'
import logger from '~/utils/logger'

const DYNAMO_TABLE_USERPLUS_COMPANY = getStringEnv('DYNAMO_TABLE_USERPLUS_COMPANY')

export type ScanCompanyResponse = {
  result: UserplusCompany[]
  last_evaluated_key?: Record<string, AttributeValue>,
}

const scanUserplusCompany = async (
  dynamodbClient: DynamoDBClient,
  last_evaluated_key?: Record<string, AttributeValue>,
): Promise<ScanCompanyResponse | undefined> => {
  logger.debug({
    message: 'DYNAMODB: Scan',
    table: DYNAMO_TABLE_USERPLUS_COMPANY,
  })

  const command = new ScanCommand({
    TableName: DYNAMO_TABLE_USERPLUS_COMPANY,
    ExclusiveStartKey: last_evaluated_key,
  })

  const { Items, LastEvaluatedKey } = await dynamodbClient.send(command)

  if (!Items) {
    return undefined
  }

  const result = Items.map((item) => (unmarshall(item) as UserplusCompany))

  if (LastEvaluatedKey) {
    last_evaluated_key = LastEvaluatedKey
  }

  return {
    result,
    last_evaluated_key,
  }
}

export default scanUserplusCompany

import {
  DynamoDBClient,
  PutItemCommand,
} from '@aws-sdk/client-dynamodb'
import { marshall } from '@aws-sdk/util-dynamodb'

import {
  AnalysisplusPeople,
  AnalysisplusPeopleBody,
  AnalysisplusPeopleKey,
} from '~/models/dynamo/analysisplus/people/table'
import {
  createConditionExpression,
  createExpressionAttributeNames,
  createExpressionAttributeValues,
} from '~/utils/dynamo/expression'
import getStringEnv from '~/utils/get-string-env'
import logger from '~/utils/logger'

const DYNAMO_TABLE_ANALYSISPLUS_PEOPLE = getStringEnv('DYNAMO_TABLE_ANALYSISPLUS_PEOPLE')

const putAnalysisplusPeople = async (
  key: AnalysisplusPeopleKey,
  data: AnalysisplusPeopleBody,
  dynamodbClient: DynamoDBClient,
): Promise<void> => {
  logger.debug({
    message: 'DYNAMODB: PutItem',
    table: DYNAMO_TABLE_ANALYSISPLUS_PEOPLE,
    ...key,
  })

  const now = new Date().toISOString()

  const put: AnalysisplusPeople = {
    ...key,
    ...data,
    created_at: now,
    updated_at: now,
  }

  const command = new PutItemCommand({
    TableName: DYNAMO_TABLE_ANALYSISPLUS_PEOPLE,
    Item: marshall(put),
    ExpressionAttributeNames: createExpressionAttributeNames(key),
    ExpressionAttributeValues: createExpressionAttributeValues(key),
    ConditionExpression: createConditionExpression(key, false),
  })

  await dynamodbClient.send(command)
}

export default putAnalysisplusPeople

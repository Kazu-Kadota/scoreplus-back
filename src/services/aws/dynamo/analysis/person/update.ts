import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import {
  DynamoDBDocumentClient,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb'

import {
  AnalysisplusPeople,
  AnalysisplusPeopleBody,
  AnalysisplusPeopleKey,
} from '~/models/dynamo/analysisplus/people/table'
import {
  createConditionExpression,
  createExpressionAttributeNames,
  createExpressionAttributeValues,
  createUpdateExpression,
} from '~/utils/dynamo/expression'
import getStringEnv from '~/utils/get-string-env'
import logger from '~/utils/logger'

const DYNAMO_TABLE_ANALYSISPLUS_PEOPLE = getStringEnv('DYNAMO_TABLE_ANALYSISPLUS_PEOPLE')

const updateAnalysisplusPeople = async (
  key: AnalysisplusPeopleKey,
  body: Partial<AnalysisplusPeopleBody>,
  dynamodbClient: DynamoDBClient,
): Promise<void> => {
  const dynamoDocClient = DynamoDBDocumentClient.from(dynamodbClient)
  logger.debug({
    message: 'DYNAMODB: UpdateItem',
    table: DYNAMO_TABLE_ANALYSISPLUS_PEOPLE,
    ...key,
  })

  const now = new Date().toISOString()

  const update: Partial<AnalysisplusPeople> = {
    ...key,
    ...body,
    updated_at: now,
  }

  const command = new UpdateCommand({
    TableName: DYNAMO_TABLE_ANALYSISPLUS_PEOPLE,
    Key: key,
    UpdateExpression: createUpdateExpression(update, Object.keys(key)),
    ExpressionAttributeNames: createExpressionAttributeNames(update),
    ExpressionAttributeValues: createExpressionAttributeValues(update, true),
    ConditionExpression: createConditionExpression(key, true),
  })

  await dynamoDocClient.send(command)
}

export default updateAnalysisplusPeople

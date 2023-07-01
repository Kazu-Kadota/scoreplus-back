import {
  DynamoDBClient,
  UpdateItemCommand,
} from '@aws-sdk/client-dynamodb'
import { marshall } from '@aws-sdk/util-dynamodb'
import { PersonRequestKey, PersonRequest, PersonRequestBody } from 'src/models/dynamo/request-person'
import {
  createConditionExpression,
  createExpressionAttributeNames,
  createExpressionAttributeValues,
  createUpdateExpression,
} from 'src/utils/dynamo/expression'
import getStringEnv from 'src/utils/get-string-env'
import logger from 'src/utils/logger'

const DYNAMO_TABLE_REQUESTPLUS_ANALYSIS_PERSON = getStringEnv('DYNAMO_TABLE_REQUESTPLUS_ANALYSIS_PERSON')

const updateRequestPerson = async (
  key: PersonRequestKey,
  body: Partial<PersonRequestBody>,
  dynamodbClient: DynamoDBClient,
): Promise<void> => {
  logger.debug({
    message: 'Updating request person',
    ...key,
  })

  const now = new Date().toISOString()

  const update: Partial<PersonRequest> = {
    ...key,
    ...body,
    updated_at: now,
  }

  const command = new UpdateItemCommand({
    TableName: DYNAMO_TABLE_REQUESTPLUS_ANALYSIS_PERSON,
    Key: marshall(key),
    UpdateExpression: createUpdateExpression(update, Object.keys(key)),
    ExpressionAttributeNames: createExpressionAttributeNames(update),
    ExpressionAttributeValues: createExpressionAttributeValues(update),
    ConditionExpression: createConditionExpression(key, true),
  })

  await dynamodbClient.send(command)
}

export default updateRequestPerson

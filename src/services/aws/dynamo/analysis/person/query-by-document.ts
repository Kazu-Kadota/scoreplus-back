import {
  DynamoDBClient,
  QueryCommand,
} from '@aws-sdk/client-dynamodb'
import { unmarshall } from '@aws-sdk/util-dynamodb'

import { AnalysisplusPeople } from '~/models/dynamo/analysisplus/people/table'
import {
  createConditionExpression,
  createExpressionAttributeNames,
  createExpressionAttributeValues,
} from '~/utils/dynamo/expression'
import getStringEnv from '~/utils/get-string-env'
import logger from '~/utils/logger'

const DYNAMO_TABLE_ANALYSISPLUS_PEOPLE = getStringEnv('DYNAMO_TABLE_ANALYSISPLUS_PEOPLE')

export type QueryAnalysisplusPeopleByDocumentQuery = {
  document: string
}

const queryAnalysisplusPeopleByDocument = async (
  query: QueryAnalysisplusPeopleByDocumentQuery,
  dynamodbClient: DynamoDBClient,
): Promise<AnalysisplusPeople[] | undefined> => {
  logger.debug({
    message: 'DYNAMODB: Query',
    table: DYNAMO_TABLE_ANALYSISPLUS_PEOPLE,
    ...query,
  })

  const command = new QueryCommand({
    TableName: DYNAMO_TABLE_ANALYSISPLUS_PEOPLE,
    IndexName: 'document-index',
    KeyConditionExpression: createConditionExpression(query, true),
    ExpressionAttributeNames: createExpressionAttributeNames(query),
    ExpressionAttributeValues: createExpressionAttributeValues(query),
  })

  const { Items } = await dynamodbClient.send(command)

  if (!Items) {
    return undefined
  }

  const result = Items.map((item) => (unmarshall(item) as AnalysisplusPeople))

  return result
}

export default queryAnalysisplusPeopleByDocument

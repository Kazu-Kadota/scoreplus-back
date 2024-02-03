import {
  DynamoDBClient,
  QueryCommand,
} from '@aws-sdk/client-dynamodb'
import { unmarshall } from '@aws-sdk/util-dynamodb'

import { ComboReleaseExtractKey } from '~/models/dynamo/requestplus/combo'
import { RequestplusFinishedAnalysisPerson } from '~/models/dynamo/requestplus/finished-analysis-person/table'
import {
  createConditionExpression,
  createExpressionAttributeNames,
  createExpressionAttributeValues,
} from '~/utils/dynamo/expression'
import getStringEnv from '~/utils/get-string-env'
import logger from '~/utils/logger'

const DYNAMO_TABLE_REQUESTPLUS_FINISHED_ANALYSIS_PERSON = getStringEnv('DYNAMO_TABLE_REQUESTPLUS_FINISHED_ANALYSIS_PERSON')

const queryRequestplusFinishedAnalysisPersonByComboId = async (
  query: ComboReleaseExtractKey,
  dynamodbClient: DynamoDBClient,
): Promise<RequestplusFinishedAnalysisPerson[] | undefined> => {
  logger.debug({
    message: 'DYNAMODB: Query',
    table: DYNAMO_TABLE_REQUESTPLUS_FINISHED_ANALYSIS_PERSON,
    ...query,
  })

  const command = new QueryCommand({
    TableName: DYNAMO_TABLE_REQUESTPLUS_FINISHED_ANALYSIS_PERSON,
    IndexName: 'combo-id-index',
    KeyConditionExpression: createConditionExpression(query, true),
    ExpressionAttributeNames: createExpressionAttributeNames(query),
    ExpressionAttributeValues: createExpressionAttributeValues(query),
  })

  const { Items } = await dynamodbClient.send(command)

  if (!Items) {
    return undefined
  }

  const result = Items.map((item) => (unmarshall(item) as RequestplusFinishedAnalysisPerson))

  return result
}

export default queryRequestplusFinishedAnalysisPersonByComboId

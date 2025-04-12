import {
  DynamoDBClient,
  DeleteItemCommand,
} from '@aws-sdk/client-dynamodb'
import { marshall } from '@aws-sdk/util-dynamodb'

import { RequestplusValidateAnalysisPersonKey } from '~/models/dynamo/requestplus/validate-analysis-person/table'
import {
  createConditionExpression,
  createExpressionAttributeNames,
  createExpressionAttributeValues,
} from '~/utils/dynamo/expression'
import getStringEnv from '~/utils/get-string-env'
import logger from '~/utils/logger'

const DYNAMO_TABLE_REQUESTPLUS_VALIDATE_ANALYSIS_PERSON = getStringEnv('DYNAMO_TABLE_REQUESTPLUS_VALIDATE_ANALYSIS_PERSON')

const deleteRequestplusValidateAnalysisPerson = async (
  key: RequestplusValidateAnalysisPersonKey,
  dynamodbClient: DynamoDBClient,
): Promise<void> => {
  logger.debug({
    message: 'DYNAMODB: DeleteItem',
    table: DYNAMO_TABLE_REQUESTPLUS_VALIDATE_ANALYSIS_PERSON,
    ...key,
  })

  const command = new DeleteItemCommand({
    TableName: DYNAMO_TABLE_REQUESTPLUS_VALIDATE_ANALYSIS_PERSON,
    Key: marshall(key),
    ExpressionAttributeNames: createExpressionAttributeNames(key),
    ExpressionAttributeValues: createExpressionAttributeValues(key),
    ConditionExpression: createConditionExpression(key, true),
  })

  await dynamodbClient.send(command)
}

export default deleteRequestplusValidateAnalysisPerson

import {
  DynamoDBClient,
  QueryCommand,
} from '@aws-sdk/client-dynamodb'
import { unmarshall } from '@aws-sdk/util-dynamodb'

import { ComboReleaseExtractKey } from '~/models/dynamo/requestplus/combo'
import { RequestplusValidateAnalysisPerson } from '~/models/dynamo/requestplus/validate-analysis-person/table'
import {
  createExpressionAttributeNames,
  createExpressionAttributeValues,
} from '~/utils/dynamo/expression'
import getStringEnv from '~/utils/get-string-env'
import logger from '~/utils/logger'

const DYNAMO_TABLE_REQUESTPLUS_VALIDATE_ANALYSIS_PERSON = getStringEnv('DYNAMO_TABLE_REQUESTPLUS_VALIDATE_ANALYSIS_PERSON')

const queryRequestplusValidateAnalysisPersonByComboId = async (
  query: ComboReleaseExtractKey,
  dynamodbClient: DynamoDBClient,
): Promise<RequestplusValidateAnalysisPerson[] | undefined> => {
  logger.debug({
    message: 'DYNAMODB: Query',
    table: DYNAMO_TABLE_REQUESTPLUS_VALIDATE_ANALYSIS_PERSON,
    ...query,
  })

  const command = new QueryCommand({
    TableName: DYNAMO_TABLE_REQUESTPLUS_VALIDATE_ANALYSIS_PERSON,
    IndexName: 'combo-id-index',
    KeyConditionExpression: '#combo_id = :combo_id',
    ExpressionAttributeNames: createExpressionAttributeNames(query),
    ExpressionAttributeValues: createExpressionAttributeValues(query),
  })

  const { Items } = await dynamodbClient.send(command)

  if (!Items) {
    return undefined
  }

  const result = Items.map((item) => (unmarshall(item) as RequestplusValidateAnalysisPerson))

  return result
}

export default queryRequestplusValidateAnalysisPersonByComboId

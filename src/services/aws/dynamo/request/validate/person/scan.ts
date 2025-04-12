import {
  DynamoDBClient,
  ScanCommand,
  AttributeValue,
} from '@aws-sdk/client-dynamodb'
import { unmarshall } from '@aws-sdk/util-dynamodb'

import { RequestplusValidateAnalysisPerson } from '~/models/dynamo/requestplus/validate-analysis-person/table'
import {
  createConditionExpression,
  createExpressionAttributeNames,
  createExpressionAttributeValues,
} from '~/utils/dynamo/expression'
import getStringEnv from '~/utils/get-string-env'
import logger from '~/utils/logger'

const DYNAMO_TABLE_REQUESTPLUS_VALIDATE_ANALYSIS_PERSON = getStringEnv('DYNAMO_TABLE_REQUESTPLUS_VALIDATE_ANALYSIS_PERSON')

export type ScanRequestplusValidateAnalysisPersonParams = {
  company_name?: string
}

export type ScanRequestplusValidateAnalysisPersonResponse = {
  result: RequestplusValidateAnalysisPerson[],
  last_evaluated_key?: Record<string, AttributeValue>
}

const scanRequestplusValidateAnalysisPerson = async (
  scan: ScanRequestplusValidateAnalysisPersonParams,
  dynamodbClient: DynamoDBClient,
  last_evaluated_key?: Record<string, AttributeValue>,
): Promise<ScanRequestplusValidateAnalysisPersonResponse | undefined> => {
  logger.debug({
    message: 'DYNAMODB: Scan',
    table: DYNAMO_TABLE_REQUESTPLUS_VALIDATE_ANALYSIS_PERSON,
    ...scan,
  })

  const command = new ScanCommand({
    TableName: DYNAMO_TABLE_REQUESTPLUS_VALIDATE_ANALYSIS_PERSON,
    ExpressionAttributeNames: createExpressionAttributeNames(scan),
    ExpressionAttributeValues: createExpressionAttributeValues(scan),
    ExclusiveStartKey: last_evaluated_key,
    FilterExpression: createConditionExpression(scan, true),
  })

  const { Items, LastEvaluatedKey } = await dynamodbClient.send(command)

  if (!Items) {
    return undefined
  }

  const result = Items.map((item) => (unmarshall(item) as RequestplusValidateAnalysisPerson))

  if (LastEvaluatedKey) {
    last_evaluated_key = LastEvaluatedKey
  }

  return {
    result,
    last_evaluated_key,
  }
}

export default scanRequestplusValidateAnalysisPerson

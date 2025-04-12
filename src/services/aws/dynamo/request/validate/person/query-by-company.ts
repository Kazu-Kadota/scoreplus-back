import {
  AttributeValue,
  DynamoDBClient,
  QueryCommand,
} from '@aws-sdk/client-dynamodb'
import { unmarshall } from '@aws-sdk/util-dynamodb'

import { RequestplusValidateAnalysisPerson } from '~/models/dynamo/requestplus/validate-analysis-person/table'
import getStringEnv from '~/utils/get-string-env'
import logger from '~/utils/logger'

const DYNAMO_TABLE_REQUESTPLUS_VALIDATE_ANALYSIS_PERSON = getStringEnv('DYNAMO_TABLE_REQUESTPLUS_VALIDATE_ANALYSIS_PERSON')

export type QueryRequestplusValidateAnalysisPersonByCompanyQuery = {
  start_date: string
  final_date: string
  company_name: string
}

export type QueryRequestplusValidateAnalysisPersonByCompanyResponse = {
  result: RequestplusValidateAnalysisPerson[]
  last_evaluated_key?: Record<string, AttributeValue>
  count: number
}

const queryRequestplusValidateAnalysisPersonByCompany = async (
  query: QueryRequestplusValidateAnalysisPersonByCompanyQuery,
  dynamodbClient: DynamoDBClient,
  last_evaluated_key?: Record<string, AttributeValue>,
): Promise<QueryRequestplusValidateAnalysisPersonByCompanyResponse | undefined> => {
  logger.debug({
    message: 'DYNAMODB: Query',
    table: DYNAMO_TABLE_REQUESTPLUS_VALIDATE_ANALYSIS_PERSON,
    ...query,
  })

  const {
    start_date,
    final_date,
    company_name,
  } = query

  const command = new QueryCommand({
    TableName: DYNAMO_TABLE_REQUESTPLUS_VALIDATE_ANALYSIS_PERSON,
    IndexName: 'company-name-index',
    KeyConditionExpression: '#company_name = :company_name',
    ExpressionAttributeNames: {
      '#created_at': 'created_at',
      '#company_name': 'company_name',
    },
    ExpressionAttributeValues: {
      ':start_date': { S: start_date },
      ':final_date': { S: final_date },
      ':company_name': { S: company_name },
    },
    ExclusiveStartKey: last_evaluated_key,
    FilterExpression: '#created_at BETWEEN :start_date AND :final_date',
  })

  const { Items, LastEvaluatedKey, Count } = await dynamodbClient.send(command)

  if (!Items) {
    return undefined
  }

  if (Count === undefined) {
    return undefined
  }

  const result = Items.map((item) => (unmarshall(item) as RequestplusValidateAnalysisPerson))

  return {
    result,
    last_evaluated_key: LastEvaluatedKey,
    count: Count,
  }
}

export default queryRequestplusValidateAnalysisPersonByCompany

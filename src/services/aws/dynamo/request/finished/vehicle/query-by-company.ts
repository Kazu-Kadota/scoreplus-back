import {
  AttributeValue,
  DynamoDBClient,
  QueryCommand,
} from '@aws-sdk/client-dynamodb'
import { unmarshall } from '@aws-sdk/util-dynamodb'

import { RequestplusFinishedAnalysisVehicle } from '~/models/dynamo/requestplus/finished-analysis-vehicle/table'
import getStringEnv from '~/utils/get-string-env'
import logger from '~/utils/logger'

const DYNAMO_TABLE_REQUESTPLUS_FINISHED_ANALYSIS_VEHICLE = getStringEnv('DYNAMO_TABLE_REQUESTPLUS_FINISHED_ANALYSIS_VEHICLE')

export type QueryFinishedRequestVehicleByCompany = {
  start_date: string
  final_date: string
  company_name: string
}

export type QueryFinishedRequestVehicleByCompanyResponse = {
  result: RequestplusFinishedAnalysisVehicle[]
  last_evaluated_key?: Record<string, AttributeValue>
  count: number
}

const queryRequestplusFinishedAnalysisVehicleByCompany = async (
  query: QueryFinishedRequestVehicleByCompany,
  dynamodbClient: DynamoDBClient,
  last_evaluated_key?: Record<string, AttributeValue>,
): Promise<QueryFinishedRequestVehicleByCompanyResponse | undefined> => {
  logger.debug({
    message: 'DYNAMODB: Query',
    table: DYNAMO_TABLE_REQUESTPLUS_FINISHED_ANALYSIS_VEHICLE,
    ...query,
  })

  const {
    start_date,
    final_date,
    company_name,
  } = query

  const command = new QueryCommand({
    TableName: DYNAMO_TABLE_REQUESTPLUS_FINISHED_ANALYSIS_VEHICLE,
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

  const result = Items.map((item) => (unmarshall(item) as RequestplusFinishedAnalysisVehicle))

  return {
    result,
    last_evaluated_key: LastEvaluatedKey,
    count: Count,
  }
}

export default queryRequestplusFinishedAnalysisVehicleByCompany

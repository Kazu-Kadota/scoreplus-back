import {
  DynamoDBClient,
  GetItemCommand,
} from '@aws-sdk/client-dynamodb'
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb'

import {
  RequestplusFinishedAnalysisPerson,
  RequestplusFinishedAnalysisPersonKey,
} from '~/models/dynamo/requestplus/finished-analysis-person/table'
import getStringEnv from '~/utils/get-string-env'
import logger from '~/utils/logger'

const DYNAMO_TABLE_REQUESTPLUS_FINISHED_ANALYSIS_PERSON = getStringEnv('DYNAMO_TABLE_REQUESTPLUS_FINISHED_ANALYSIS_PERSON')

const getRequestplusFinishedAnalysisPerson = async (
  key: RequestplusFinishedAnalysisPersonKey,
  dynamodbClient: DynamoDBClient,
): Promise<RequestplusFinishedAnalysisPerson | undefined> => {
  logger.debug({
    message: 'DYNAMODB: GetItem',
    table: DYNAMO_TABLE_REQUESTPLUS_FINISHED_ANALYSIS_PERSON,
    ...key,
  })

  const command = new GetItemCommand({
    TableName: DYNAMO_TABLE_REQUESTPLUS_FINISHED_ANALYSIS_PERSON,
    Key: marshall(key),
  })

  const result = await dynamodbClient.send(command)

  if (!result.Item) {
    return undefined
  }

  return unmarshall(result.Item) as RequestplusFinishedAnalysisPerson
}

export default getRequestplusFinishedAnalysisPerson

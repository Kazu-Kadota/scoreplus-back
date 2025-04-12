import {
  DynamoDBClient,
  GetItemCommand,
} from '@aws-sdk/client-dynamodb'
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb'

import { RequestplusValidateAnalysisPerson, RequestplusValidateAnalysisPersonKey } from '~/models/dynamo/requestplus/validate-analysis-person/table'
import getStringEnv from '~/utils/get-string-env'
import logger from '~/utils/logger'

const DYNAMO_TABLE_REQUESTPLUS_VALIDATE_ANALYSIS_PERSON = getStringEnv('DYNAMO_TABLE_REQUESTPLUS_VALIDATE_ANALYSIS_PERSON')

const getRequestplusValidateAnalysisPerson = async (
  key: RequestplusValidateAnalysisPersonKey,
  dynamodbClient: DynamoDBClient,
): Promise<RequestplusValidateAnalysisPerson | undefined> => {
  logger.debug({
    message: 'DYNAMODB: GetItem',
    table: DYNAMO_TABLE_REQUESTPLUS_VALIDATE_ANALYSIS_PERSON,
    ...key,
  })

  const command = new GetItemCommand({
    TableName: DYNAMO_TABLE_REQUESTPLUS_VALIDATE_ANALYSIS_PERSON,
    Key: marshall(key),
  })

  const result = await dynamodbClient.send(command)

  if (!result.Item) {
    return undefined
  }

  return unmarshall(result.Item) as RequestplusValidateAnalysisPerson
}

export default getRequestplusValidateAnalysisPerson

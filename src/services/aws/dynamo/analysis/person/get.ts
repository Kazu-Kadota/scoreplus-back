import {
  DynamoDBClient,
  GetItemCommand,
} from '@aws-sdk/client-dynamodb'
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb'

import { AnalysisplusPeople, AnalysisplusPeopleKey } from '~/models/dynamo/analysisplus/people/table'
import getStringEnv from '~/utils/get-string-env'
import logger from '~/utils/logger'

const DYNAMO_TABLE_ANALYSISPLUS_PEOPLE = getStringEnv('DYNAMO_TABLE_ANALYSISPLUS_PEOPLE')

const getAnalysisplusPeople = async (
  key: AnalysisplusPeopleKey,
  dynamodbClient: DynamoDBClient,
): Promise<AnalysisplusPeople | undefined> => {
  logger.debug({
    message: 'DYNAMODB: GetItem',
    table: DYNAMO_TABLE_ANALYSISPLUS_PEOPLE,
    ...key,
  })

  const command = new GetItemCommand({
    TableName: DYNAMO_TABLE_ANALYSISPLUS_PEOPLE,
    Key: marshall(key),
  })

  const result = await dynamodbClient.send(command)

  if (!result.Item) {
    return undefined
  }

  return unmarshall(result.Item) as AnalysisplusPeople
}

export default getAnalysisplusPeople

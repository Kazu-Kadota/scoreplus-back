import {
  DynamoDBClient,
  GetItemCommand,
} from '@aws-sdk/client-dynamodb'
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb'

import { RequestplusCompanyConsult, RequestplusCompanyConsultKey } from '~/models/dynamo/requestplus/company-consult/table'

import getStringEnv from '~/utils/get-string-env'
import logger from '~/utils/logger'

const DYNAMO_TABLE_REQUESTPLUS_COMPANY_CONSULT = getStringEnv('DYNAMO_TABLE_REQUESTPLUS_COMPANY_CONSULT')

const getRequestplusCompanyConsult = async (
  key: RequestplusCompanyConsultKey,
  dynamodbClient: DynamoDBClient,
): Promise<RequestplusCompanyConsult | undefined> => {
  logger.debug({
    message: 'DYNAMODB: GetItem',
    table: DYNAMO_TABLE_REQUESTPLUS_COMPANY_CONSULT,
    ...key,
  })

  const command = new GetItemCommand({
    TableName: DYNAMO_TABLE_REQUESTPLUS_COMPANY_CONSULT,
    Key: marshall(key),
  })

  const result = await dynamodbClient.send(command)

  if (!result.Item) {
    return undefined
  }

  return unmarshall(result.Item) as RequestplusCompanyConsult
}

export default getRequestplusCompanyConsult

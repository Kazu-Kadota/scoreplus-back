import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { APIGatewayProxyEvent } from 'aws-lambda'
import { ReturnResponse } from 'src/models/lambda'
import putCompany from 'src/services/aws/dynamo/company/put'
import logger from 'src/utils/logger'

import validateRegisterCompany from './validate'
import verifyExistentCompany from './verify-existent-company'

const dynamodbClient = new DynamoDBClient({ region: 'us-east-1' })

const registerCompany = async (event: APIGatewayProxyEvent): Promise<ReturnResponse<any>> => {
  const body = validateRegisterCompany(JSON.parse(event.body as string))

  await verifyExistentCompany(body.cnpj, dynamodbClient)

  await putCompany(body, dynamodbClient)

  logger.info({
    message: 'Company registered successfully',
    company_name: body.name,
    cnpj: body.cnpj,
  })

  return {
    body: {
      message: 'Company registered successfully',
      company_name: body.name,
      cnpj: body.cnpj,
    },
  }
}

export default registerCompany

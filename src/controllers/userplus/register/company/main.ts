import { DynamoDBClient } from '@aws-sdk/client-dynamodb'

import { Controller } from '~/models/lambda'
import putUserplusCompany from '~/services/aws/dynamo/company/put'
import logger from '~/utils/logger'

import validateRegisterCompany from './validate'
import verifyExistentCompany from './verify-existent-company'

const dynamodbClient = new DynamoDBClient({ region: 'us-east-1' })

const registerCompany: Controller<true> = async (req) => {
  logger.debug({
    message: 'Start register company path',
  })

  const body = validateRegisterCompany(JSON.parse(req.body as string))

  await verifyExistentCompany(body.cnpj, dynamodbClient)

  await putUserplusCompany(body, dynamodbClient)

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

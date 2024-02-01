import { DynamoDBClient } from '@aws-sdk/client-dynamodb'

import { UserplusCompany } from '~/models/dynamo/userplus/company'
import { Controller } from '~/models/lambda'
import logger from '~/utils/logger'

import getCompanyByNameAdapter from './get-company-adapter'

const dynamodbClient = new DynamoDBClient({ region: 'us-east-1' })

const companyHandler: Controller<true, UserplusCompany> = async (req) => {
  logger.info({
    message: 'Request to get company',
  })

  const company = await getCompanyByNameAdapter(req.user.company_id, dynamodbClient)

  logger.info({
    message: 'Success on get company',
    company_id: company.company_id,
  })

  return {
    body: company,
  }
}

export default companyHandler

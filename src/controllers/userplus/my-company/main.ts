import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { Company } from 'src/models/dynamo/company'
import { UserInfoFromJwt } from 'src/utils/extract-jwt-lambda'
import logger from 'src/utils/logger'

import getCompanyByNameAdapter from './get-company-adapter'

const dynamodbClient = new DynamoDBClient({ region: 'us-east-1' })

const companyHandler = async (user_info: UserInfoFromJwt): Promise<Company> => {
  const company = await getCompanyByNameAdapter(user_info.company_name, dynamodbClient)

  logger.info({
    message: 'Success on get company',
    company_id: company.company_id,
  })

  return company
}

export default companyHandler

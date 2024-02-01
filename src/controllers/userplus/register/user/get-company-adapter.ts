import { DynamoDBClient } from '@aws-sdk/client-dynamodb'

import { UserplusCompany } from '~/models/dynamo/userplus/company'
import queryUserplusCompanyByName, { QueryUserplusCompanyByName } from '~/services/aws/dynamo/company/query-by-name'
import NotFoundError from '~/utils/errors/404-not-found'
import logger from '~/utils/logger'

const getCompanyByNameAdapter = async (
  company_name: string,
  dynamodbClient: DynamoDBClient,
): Promise<UserplusCompany> => {
  const query: QueryUserplusCompanyByName = {
    name: company_name,
  }
  const company = await queryUserplusCompanyByName(query, dynamodbClient)

  if (!company || !company[0]) {
    logger.warn({
      message: 'Company not exist',
      company_name,
    })

    throw new NotFoundError('Company not exist')
  }

  return company[0]
}

export default getCompanyByNameAdapter

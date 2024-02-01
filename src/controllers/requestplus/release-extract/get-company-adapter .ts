import { DynamoDBClient } from '@aws-sdk/client-dynamodb'

import { UserplusCompany } from '~/models/dynamo/userplus/company'
import queryCompanyByName, { QueryUserplusCompanyByName } from '~/services/aws/dynamo/company/query-by-name'
import NotFoundError from '~/utils/errors/404-not-found'
import logger from '~/utils/logger'

const getCompanyAdapter = async (
  company_name: string,
  dynamodbClient: DynamoDBClient,
): Promise<UserplusCompany> => {
  const query_company: QueryUserplusCompanyByName = {
    name: company_name,
  }
  const company = await queryCompanyByName(query_company, dynamodbClient)

  if (!company || !company[0]) {
    logger.warn({
      message: 'Company does not exist',
      company_name,
    })

    throw new NotFoundError('Empresa não encontrado')
  }

  return company[0]
}

export default getCompanyAdapter

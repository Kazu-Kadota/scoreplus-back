import { DynamoDBClient } from '@aws-sdk/client-dynamodb'

import { UserplusCompany, UserplusCompanyKey } from '~/models/dynamo/userplus/company'
import getUserplusCompany from '~/services/aws/dynamo/company/get'
import NotFoundError from '~/utils/errors/404-not-found'
import logger from '~/utils/logger'

const getCompanyByNameAdapter = async (
  company_id: string,
  dynamodbClient: DynamoDBClient,
): Promise<UserplusCompany> => {
  const company_key: UserplusCompanyKey = {
    company_id,
  }
  const company = await getUserplusCompany(company_key, dynamodbClient)

  if (!company) {
    logger.warn({
      message: 'Company not exist',
      company_name: company_id,
    })

    throw new NotFoundError('Company not exist')
  }

  return company
}

export default getCompanyByNameAdapter

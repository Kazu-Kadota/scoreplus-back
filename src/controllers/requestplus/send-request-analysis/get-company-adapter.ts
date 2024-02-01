import { DynamoDBClient } from '@aws-sdk/client-dynamodb'

import { UserplusCompany } from '~/models/dynamo/userplus/company'
import queryUserplusCompanyByName, { QueryUserplusCompanyByName } from '~/services/aws/dynamo/company/query-by-name'
import InternalServerError from '~/utils/errors/500-internal-server-error'
import logger from '~/utils/logger'

const getCompanyAdapter = async (
  company_name: string,
  dynamodbClient: DynamoDBClient,
): Promise<UserplusCompany> => {
  const query: QueryUserplusCompanyByName = {
    name: company_name,
  }
  const company = await queryUserplusCompanyByName(query, dynamodbClient)

  if (!company || !company[0]) {
    logger.warn({
      message: 'Company does not exist',
      company_name,
    })

    throw new InternalServerError('Company does not exist')
  }

  return company[0]
}

export default getCompanyAdapter

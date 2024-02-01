import { DynamoDBClient } from '@aws-sdk/client-dynamodb'

import queryUserplusCompanyByCnpj, { QueryUserplusCompanyByCnpj } from '~/services/aws/dynamo/company/query-by-cnpj'
import ConflictError from '~/utils/errors/409-conflict'
import logger from '~/utils/logger'

const verifyExistentCompany = async (cnpj:string, dynamodbClient: DynamoDBClient): Promise<void> => {
  const query: QueryUserplusCompanyByCnpj = {
    cnpj,
  }
  const companyExist = await queryUserplusCompanyByCnpj(query, dynamodbClient)

  if (companyExist && companyExist[0]) {
    logger.warn({
      message: 'Company already exist with this cnpj',
      cnpj,
    })

    throw new ConflictError('Empresa já existe com este cnpj', cnpj)
  }
}

export default verifyExistentCompany

import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import queryByCnpj from 'src/services/aws/dynamo/company/query-by-cnpj'
import ErrorHandler from 'src/utils/error-handler'
import logger from 'src/utils/logger'

const verifyExistentCompany = async (cnpj:string, dynamodbClient: DynamoDBClient): Promise<void> => {
  const companyExist = await queryByCnpj(cnpj, dynamodbClient)

  if (companyExist && companyExist[0]) {
    logger.warn({
      message: 'Company already exist with this cnpj',
      cnpj,
    })

    throw new ErrorHandler('Empresa já existe com este cnpj', 409)
  }
}

export default verifyExistentCompany

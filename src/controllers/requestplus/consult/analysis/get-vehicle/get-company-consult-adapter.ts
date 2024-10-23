import { DynamoDBClient } from '@aws-sdk/client-dynamodb'

import { RequestplusCompanyConsult, RequestplusCompanyConsultKey } from '~/models/dynamo/requestplus/company-consult/table'
import getRequestplusCompanyConsult from '~/services/aws/dynamo/request/company-consult/get'

export type GetCompanyConsultAdapterParams = {
  company_id: string
  year_month: string
  dynamodbClient: DynamoDBClient
}

const getCompanyConsultAdapter = async ({
  company_id,
  dynamodbClient,
  year_month,
}: GetCompanyConsultAdapterParams): Promise<RequestplusCompanyConsult | undefined> => {
  const get_consult: RequestplusCompanyConsultKey = {
    company_id,
    year_month,
  }
  const company_consult = await getRequestplusCompanyConsult(get_consult, dynamodbClient)

  return company_consult
}

export default getCompanyConsultAdapter

import { DynamoDBClient } from '@aws-sdk/client-dynamodb'

import { RequestplusCompanyConsult, RequestplusCompanyConsultKey } from '~/models/dynamo/requestplus/company-consult/table'

import getRequestplusCompanyConsult from '~/services/aws/dynamo/request/company-consult/get'

export type GetCompanyConsultAdapterParams = {
  company_id: string
  year_month: string
  dynamodbClient: DynamoDBClient,
}

const getCompanyConsultAdapter = async ({
  dynamodbClient,
  company_id,
  year_month,
}: GetCompanyConsultAdapterParams): Promise<RequestplusCompanyConsult | undefined> => {
  const get_key: RequestplusCompanyConsultKey = {
    company_id,
    year_month,
  }

  const company_consult = await getRequestplusCompanyConsult(get_key, dynamodbClient)

  return company_consult
}

export default getCompanyConsultAdapter

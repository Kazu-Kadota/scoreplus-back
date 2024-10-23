import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import dayjs from 'dayjs'

import { RequestplusCompanyConsultBody, RequestplusCompanyConsultKey } from '~/models/dynamo/requestplus/company-consult/table'
import { RequestplusFinishedAnalysisPerson, RequestplusFinishedAnalysisPersonBody, RequestplusFinishedAnalysisPersonKey } from '~/models/dynamo/requestplus/finished-analysis-person/table'
import putRequestplusCompanyConsult from '~/services/aws/dynamo/request/company-consult/put'
import updateRequestplusCompanyConsult from '~/services/aws/dynamo/request/company-consult/update'
import updateRequestplusFinishedRequestPerson from '~/services/aws/dynamo/request/finished/person/update'
import { UserFromJwt } from '~/utils/extract-jwt-lambda'

import getCompanyConsultAdapter, { GetCompanyConsultAdapterParams } from './get-company-consult-adapter'

export type CountConsultParams = {
  finished_person: RequestplusFinishedAnalysisPerson
  user_info: UserFromJwt
  dynamodbClient: DynamoDBClient
}

const countConsult = async ({
  finished_person,
  user_info,
  dynamodbClient,
}: CountConsultParams) => {
  const now = new Date().toISOString()
  const year_month = dayjs().format('YYYY-MM')

  if (user_info.company_name === finished_person.company_name) {
    if (!finished_person.already_consulted) {
      const finished_person_key: RequestplusFinishedAnalysisPersonKey = {
        person_id: finished_person.person_id,
        request_id: finished_person.request_id,
      }

      const finished_person_body: Partial<RequestplusFinishedAnalysisPersonBody> = {
        already_consulted: true,
      }

      await updateRequestplusFinishedRequestPerson(finished_person_key, finished_person_body, dynamodbClient)

      return
    }
  }

  const company_consult_params: GetCompanyConsultAdapterParams = {
    company_id: user_info.company_id,
    dynamodbClient,
    year_month,
  }
  const company_consult = await getCompanyConsultAdapter(company_consult_params)

  const consult_key: RequestplusCompanyConsultKey = {
    company_id: user_info.company_id,
    year_month,
  }

  if (!company_consult) {
    const consult_person_body: RequestplusCompanyConsultBody = {
      company_name: user_info.company_name,
      number_of_request: 1,
      requests: [{
        date_of_request: now,
        person_id: finished_person.person_id,
        request_id: finished_person.request_id,
        user_id: user_info.user_id,
      }],
    }

    await putRequestplusCompanyConsult(consult_key, consult_person_body, dynamodbClient)
  } else {
    const consult_body: Partial<RequestplusCompanyConsultBody> = {
      number_of_request: company_consult.number_of_request + 1,
      requests: [
        ...company_consult.requests,
        {
          date_of_request: now,
          person_id: finished_person.person_id,
          request_id: finished_person.request_id,
          user_id: user_info.user_id,
        },
      ],
    }

    await updateRequestplusCompanyConsult(consult_key, consult_body, dynamodbClient)
  }
}

export default countConsult

import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import dayjs from 'dayjs'

import { RequestplusCompanyConsultBody, RequestplusCompanyConsultKey } from '~/models/dynamo/requestplus/company-consult/table'
import { RequestplusFinishedAnalysisVehicle, RequestplusFinishedAnalysisVehicleBody, RequestplusFinishedAnalysisVehicleKey } from '~/models/dynamo/requestplus/finished-analysis-vehicle/table'
import putRequestplusCompanyConsult from '~/services/aws/dynamo/request/company-consult/put'
import updateRequestplusCompanyConsult from '~/services/aws/dynamo/request/company-consult/update'
import updateRequestplusFinishedRequestVehicle from '~/services/aws/dynamo/request/finished/vehicle/update'
import { UserFromJwt } from '~/utils/extract-jwt-lambda'

import getCompanyConsultAdapter, { GetCompanyConsultAdapterParams } from './get-company-consult-adapter'

export type CountConsultParams = {
  finished_vehicle: RequestplusFinishedAnalysisVehicle
  user_info: UserFromJwt
  dynamodbClient: DynamoDBClient
}

const countConsult = async ({
  finished_vehicle,
  user_info,
  dynamodbClient,
}: CountConsultParams) => {
  const now = new Date().toISOString()
  const year_month = dayjs().format('YYYY-MM')

  if (user_info.company_name === finished_vehicle.company_name) {
    if (!finished_vehicle.already_consulted) {
      const finished_vehicle_key: RequestplusFinishedAnalysisVehicleKey = {
        vehicle_id: finished_vehicle.vehicle_id,
        request_id: finished_vehicle.request_id,
      }

      const finished_vehicle_body: Partial<RequestplusFinishedAnalysisVehicleBody> = {
        already_consulted: true,
      }

      await updateRequestplusFinishedRequestVehicle(finished_vehicle_key, finished_vehicle_body, dynamodbClient)

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
    const consult_body: RequestplusCompanyConsultBody = {
      company_name: user_info.company_name,
      number_of_request: 1,
      requests: [{
        date_of_request: now,
        request_id: finished_vehicle.request_id,
        user_id: user_info.user_id,
        vehicle_id: finished_vehicle.vehicle_id,
      }],
    }

    await putRequestplusCompanyConsult(consult_key, consult_body, dynamodbClient)
  } else {
    const consult_body: Partial<RequestplusCompanyConsultBody> = {
      number_of_request: company_consult.number_of_request + 1,
      requests: [
        ...company_consult.requests,
        {
          date_of_request: now,
          request_id: finished_vehicle.request_id,
          user_id: user_info.user_id,
          vehicle_id: finished_vehicle.vehicle_id,
        },
      ],
    }

    await updateRequestplusCompanyConsult(consult_key, consult_body, dynamodbClient)
  }
}

export default countConsult

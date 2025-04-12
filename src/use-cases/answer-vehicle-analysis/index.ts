import { DynamoDBClient } from '@aws-sdk/client-dynamodb'

import { RequestplusAnalysisVehicleBody, RequestplusAnalysisVehicleKey } from '~/models/dynamo/requestplus/analysis-vehicle/table'
import { SendAnswerVehicleBody } from '~/models/dynamo/requestplus/finished-analysis-vehicle/table'
import { RequestplusValidateAnalysisVehicleBody, RequestplusValidateAnalysisVehicleKey } from '~/models/dynamo/requestplus/validate-analysis-vehicle/table'
import { Timestamp } from '~/models/dynamo/timestamp'
import deleteRequestplusAnalysisVehicle from '~/services/aws/dynamo/request/analysis/vehicle/delete'
import updateRequestVehicle from '~/services/aws/dynamo/request/analysis/vehicle/update'
import putRequestplusValidateAnalysisVehicle from '~/services/aws/dynamo/request/validate/vehicle/put'
import removeEmpty from '~/utils/remove-empty'

import getRequestVehicleAdapter from './get-request-vehicle-adapter'
import informationValidationConstructor from './validate-inforation-constructor'
import verifyRequestStatus, { VerifyVehicleRequestStatusParams } from './verify-request-status'

export type UseCaseSendVehicleAnswersBody = Omit<SendAnswerVehicleBody, 'answered_at'> & {
  reason?: string
}

export type UseCaseSendVehicleAnswerParams = {
  answers_body: UseCaseSendVehicleAnswersBody[]
  dynamodbClient: DynamoDBClient
  request_id: string
  vehicle_id: string
}

const useCaseSendVehicleAnswer = async ({
  answers_body,
  dynamodbClient,
  request_id,
  vehicle_id,
}: UseCaseSendVehicleAnswerParams): Promise<void> => {
  const request_vehicle_key: RequestplusAnalysisVehicleKey = {
    vehicle_id,
    request_id,
  }

  const request_vehicle = await getRequestVehicleAdapter(request_vehicle_key, dynamodbClient)

  const verify_request_status_params: VerifyVehicleRequestStatusParams = {
    answers_body,
    request_vehicle_status: request_vehicle.status,
    vehicle_analysis_options: request_vehicle.vehicle_analysis_options,
    vehicle_id: request_vehicle.vehicle_id,
    request_id: request_vehicle.request_id,
  }

  const {
    is_finished,
    status,
    vehicle_analysis_options,
  } = verifyRequestStatus(verify_request_status_params)

  if (is_finished) {
    const vehicle_request_key: RequestplusAnalysisVehicleKey = {
      request_id: request_vehicle.request_id,
      vehicle_id: request_vehicle.vehicle_id,
    }

    const information_validation = informationValidationConstructor({
      vehicle_analysis_options,
    })

    const validate_request_key: RequestplusValidateAnalysisVehicleKey = {
      vehicle_id,
      request_id,
    }

    const now = new Date().toISOString()

    const validate_request_body: RequestplusValidateAnalysisVehicleBody & Timestamp = removeEmpty({
      ...request_vehicle,
      vehicle_analysis_options,
      status,
      information_validation,
      requested_at: request_vehicle.created_at,
      answered_at: now,
    })

    await putRequestplusValidateAnalysisVehicle(
      validate_request_key,
      validate_request_body,
      dynamodbClient,
    )

    await deleteRequestplusAnalysisVehicle(vehicle_request_key, dynamodbClient)

    return
  }

  const update_body: Partial<RequestplusAnalysisVehicleBody> = {
    status,
    vehicle_analysis_options,
  }

  await updateRequestVehicle(request_vehicle_key, update_body, dynamodbClient)
}

export default useCaseSendVehicleAnswer

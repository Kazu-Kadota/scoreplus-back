import { DynamoDBClient } from '@aws-sdk/client-dynamodb'

import { AnalysisplusVehiclesKey } from '~/models/dynamo/analysisplus/vehicle/table'
import { RequestplusAnalysisVehicleKey } from '~/models/dynamo/requestplus/analysis-vehicle/table'
import { RequestplusFinishedAnalysisVehicleBody, RequestplusFinishedAnalysisVehicleKey } from '~/models/dynamo/requestplus/finished-analysis-vehicle/table'
import { RequestplusValidateAnalysisVehicleBody, SendAnswerVehicleValidationBody } from '~/models/dynamo/requestplus/validate-analysis-vehicle/table'
import { Timestamp } from '~/models/dynamo/timestamp'
import getAnalysisplusVehicles from '~/services/aws/dynamo/analysis/vehicle/get'
import putAnalysisplusVehicles from '~/services/aws/dynamo/analysis/vehicle/put'
import updateAnalysisplusVehicles from '~/services/aws/dynamo/analysis/vehicle/update'
import putRequestplusFinishedAnalysisVehicle from '~/services/aws/dynamo/request/finished/vehicle/put'
import deleteRequestplusValidateAnalysisVehicle from '~/services/aws/dynamo/request/validate/vehicle/delete'
import updateRequestplusValidateAnalysisVehicle from '~/services/aws/dynamo/request/validate/vehicle/update'
import removeEmpty from '~/utils/remove-empty'

import getRequestValidateVehicleAdapter from './get-request-validate-vehicle-adapter'
import updateVehicleConstructor from './update-vehicle-constructor'
import vehiclesConstructor from './vehicle-constructor'
import verifyRequestStatus, { VerifyVehicleRequestStatusParams } from './verify-request-status'

export type UseCaseValidateVehicleAnalysisBody = Omit<SendAnswerVehicleValidationBody, 'validated_at'>

export type UseCaseValidateVehicleAnalysisParams = {
  dynamodbClient: DynamoDBClient
  vehicle_id: string
  request_id: string
  validations_body: UseCaseValidateVehicleAnalysisBody[]
  validation_user_id: string
}

const useCaseValidateVehicleAnalysis = async ({
  dynamodbClient,
  vehicle_id,
  request_id,
  validations_body,
  validation_user_id,
}: UseCaseValidateVehicleAnalysisParams): Promise<void> => {
  const validate_request_vehicle_key: RequestplusAnalysisVehicleKey = {
    vehicle_id,
    request_id,
  }

  const validate_request_vehicle = await getRequestValidateVehicleAdapter(validate_request_vehicle_key, dynamodbClient)

  const verify_request_status_params: VerifyVehicleRequestStatusParams = {
    answers_body: validations_body,
    vehicle_id: validate_request_vehicle.vehicle_id,
    request_id: validate_request_vehicle.request_id,
    request_vehicle_status: validate_request_vehicle.status,
    information_validation: validate_request_vehicle.information_validation,
  }

  const {
    is_finished,
    status,
    information_validation,
    is_all_approved,
  } = verifyRequestStatus(verify_request_status_params)

  const now = new Date().toISOString()

  if (is_finished) {
    const vehicle_key: AnalysisplusVehiclesKey = {
      vehicle_id: validate_request_vehicle.vehicle_id,
      plate: validate_request_vehicle.plate,
    }

    const vehicle = await getAnalysisplusVehicles(vehicle_key, dynamodbClient)

    const vehicle_request_key: RequestplusAnalysisVehicleKey = {
      request_id: validate_request_vehicle.request_id,
      vehicle_id: validate_request_vehicle.vehicle_id,
    }

    if (vehicle) {
      const vehicle_constructor = updateVehicleConstructor({
        now,
        vehicle_information_validation: information_validation,
        validate_request_vehicle,
        vehicle,
      })

      const {
        vehicle_id: vehicle_id_constructor,
        plate,
        ...vehicle_body
      } = vehicle_constructor

      const finished_request_key: RequestplusFinishedAnalysisVehicleKey = {
        vehicle_id,
        request_id,
      }

      const finished_request_body: RequestplusFinishedAnalysisVehicleBody & Timestamp = removeEmpty({
        ...validate_request_vehicle,
        information_validation,
        status,
        result: is_all_approved,
        last_validation_at: now,
        validation_user_id,
      })

      await putRequestplusFinishedAnalysisVehicle(
        finished_request_key,
        finished_request_body,
        dynamodbClient,
      )

      await updateAnalysisplusVehicles(vehicle_key, vehicle_body, dynamodbClient)

      await deleteRequestplusValidateAnalysisVehicle(vehicle_request_key, dynamodbClient)

      return
    }

    const vehicle_constructor = vehiclesConstructor({
      now,
      vehicle_information_validation: information_validation,
      validate_request_vehicle,
    })

    const {
      vehicle_id: vehicle_id_constructor,
      plate,
      ...vehicle_body
    } = vehicle_constructor

    const finished_request_key: RequestplusFinishedAnalysisVehicleKey = {
      vehicle_id,
      request_id,
    }

    const finished_request_body: RequestplusFinishedAnalysisVehicleBody & Timestamp = removeEmpty({
      ...validate_request_vehicle,
      information_validation,
      status,
      result: is_all_approved,
      validation_user_id,
    })

    await putRequestplusFinishedAnalysisVehicle(
      finished_request_key,
      finished_request_body,
      dynamodbClient,
    )

    await putAnalysisplusVehicles(vehicle_key, vehicle_body, dynamodbClient)

    await deleteRequestplusValidateAnalysisVehicle(vehicle_request_key, dynamodbClient)

    return
  }

  const update_body: Partial<RequestplusValidateAnalysisVehicleBody> = {
    status,
    information_validation,
  }

  await updateRequestplusValidateAnalysisVehicle(validate_request_vehicle_key, update_body, dynamodbClient)
}

export default useCaseValidateVehicleAnalysis

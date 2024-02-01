import { DynamoDBClient } from '@aws-sdk/client-dynamodb'

import { AnalysisplusVehiclesKey } from '~/models/dynamo/analysisplus/vehicle/table'
import { RequestplusAnalysisVehicleBody, RequestplusAnalysisVehicleKey } from '~/models/dynamo/requestplus/analysis-vehicle/table'
import { RequestplusFinishedAnalysisVehicleBody, SendAnswerVehicleBody } from '~/models/dynamo/requestplus/finished-analysis-vehicle/table'
import getAnalysisplusVehicles from '~/services/aws/dynamo/analysis/vehicle/get'
import putAnalysisplusVehicles from '~/services/aws/dynamo/analysis/vehicle/put'
import updateAnalysisplusVehicles from '~/services/aws/dynamo/analysis/vehicle/update'
import deleteRequestplusAnalysisVehicle from '~/services/aws/dynamo/request/analysis/vehicle/delete'
import updateRequestVehicle from '~/services/aws/dynamo/request/analysis/vehicle/update'
import putRequestplusFinishedAnalysisVehicle from '~/services/aws/dynamo/request/finished/vehicle/put'
import removeEmpty from '~/utils/remove-empty'

import getRequestVehicleAdapter from './get-request-vehicle-adapter'
import updateVehicleConstructor from './update-vehicle-constructor'
import vehiclesConstructor from './vehicle-constructor'
import verifyRequestStatus, { VerifyVehicleRequestStatusParams } from './verify-request-status'

export type SendVehicleAnswer = {
  answers_body: SendAnswerVehicleBody[]
  dynamodbClient: DynamoDBClient
  request_id: string
  vehicle_id: string
}

const sendVehicleAnswer = async ({
  answers_body,
  dynamodbClient,
  request_id,
  vehicle_id,
}: SendVehicleAnswer): Promise<void> => {
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
    is_all_approved,
  } = verifyRequestStatus(verify_request_status_params)

  const now = new Date().toISOString()

  if (is_finished) {
    const finished_request_key: RequestplusAnalysisVehicleKey = {
      request_id: request_vehicle.request_id,
      vehicle_id,
    }

    const finished_request_body: RequestplusFinishedAnalysisVehicleBody = removeEmpty({
      ...request_vehicle,
      vehicle_analysis_options,
      status,
      result: is_all_approved,
    })

    await putRequestplusFinishedAnalysisVehicle(
      finished_request_key,
      finished_request_body,
      dynamodbClient,
    )

    const vehicle_key: AnalysisplusVehiclesKey = {
      vehicle_id: request_vehicle.vehicle_id,
      plate: request_vehicle.plate,
    }

    const vehicle = await getAnalysisplusVehicles(vehicle_key, dynamodbClient)

    if (vehicle) {
      const vehicle_constructor = updateVehicleConstructor({
        now,
        request_vehicle,
        vehicle,
        vehicle_analysis_options,
      })

      const {
        vehicle_id,
        plate,
        ...vehicle_body
      } = vehicle_constructor

      await updateAnalysisplusVehicles(vehicle_key, vehicle_body, dynamodbClient)

      await deleteRequestplusAnalysisVehicle(
        request_vehicle_key,
        dynamodbClient,
      )

      return
    }

    const vehicle_constructor = vehiclesConstructor({
      now,
      request_vehicle,
      vehicle_analysis_options,
    })

    const {
      vehicle_id: vehicle_id_constructor,
      plate,
      ...vehicle_body
    } = vehicle_constructor

    await putAnalysisplusVehicles(vehicle_key, vehicle_body, dynamodbClient)

    await deleteRequestplusAnalysisVehicle(request_vehicle_key, dynamodbClient)
  }

  const update_body: Partial<RequestplusAnalysisVehicleBody> = {
    status,
    vehicle_analysis_options,
  }

  await updateRequestVehicle(request_vehicle_key, update_body, dynamodbClient)
}

export default sendVehicleAnswer

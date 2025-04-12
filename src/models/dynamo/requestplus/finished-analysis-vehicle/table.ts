import { AnalysisResultEnum, VehicleAnalysisStateEnum } from '../../enums/request'
import { Timestamp } from '../../timestamp'
import { VehicleAnalysisStatus } from '../analysis-vehicle/status'
import { VehicleAnalysisOptionsRequestValueAnswer } from '../analysis-vehicle/vehicle-analysis-options'
import { RequestplusValidateAnalysisVehicleBody } from '../validate-analysis-vehicle/table'
import { VehicleAnalysisInformationValidation } from '../validate-analysis-vehicle/validation-information'

export type SendAnswerVehiclePath = {
  vehicle_id: string
}

export type SendAnswerVehicleBody = VehicleAnalysisOptionsRequestValueAnswer & {
  region?: VehicleAnalysisStateEnum
}

export type RequestplusFinishedAnalysisVehicleKey = {
  request_id: string
  vehicle_id: string
}

export type RequestplusFinishedAnalysisVehicleBody = Omit<RequestplusValidateAnalysisVehicleBody, 'status' | 'information_validation'> & {
  already_consulted?: boolean
  information_validation: Partial<VehicleAnalysisInformationValidation<true>>
  release_extract_id?: string
  result: AnalysisResultEnum
  status: VehicleAnalysisStatus<true>
  validation_user_id: string
}

export type RequestplusFinishedAnalysisVehicle = RequestplusFinishedAnalysisVehicleKey & RequestplusFinishedAnalysisVehicleBody & Timestamp & {
  finished_at: string
}

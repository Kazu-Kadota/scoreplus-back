import { AnalysisResultEnum, AnalysisTypeEnum } from '../../enums/request'
import { Timestamp } from '../../timestamp'
import { VehicleRequestForms } from '../analysis-vehicle/forms'
import { VehicleAnalysisStatus } from '../analysis-vehicle/status'
import { VehicleAnalysisOptionsRequest, VehicleAnalysisOptionsRequestValueAnswer } from '../analysis-vehicle/vehicle-analysis-options'
import { VehicleAnalysisType } from '../analysis-vehicle/vehicle-analysis-type'

export type SendAnswerVehiclePath = {
  vehicle_id: string
}

export type SendAnswerVehicleBody = VehicleAnalysisOptionsRequestValueAnswer & {}

export type RequestplusFinishedAnalysisVehicleKey = {
  request_id: string
  vehicle_id: string
}

export type RequestplusFinishedAnalysisVehicleBody = VehicleRequestForms & {
  analysis_type: AnalysisTypeEnum
  combo_id?: string
  combo_number?: number
  company_name: string
  result: AnalysisResultEnum
  status: VehicleAnalysisStatus<false>
  user_id: string
  vehicle_analysis_options: Partial<VehicleAnalysisOptionsRequest<true>>
  vehicle_analysis_type: VehicleAnalysisType
}

export type RequestplusFinishedAnalysisVehicle = RequestplusFinishedAnalysisVehicleKey & RequestplusFinishedAnalysisVehicleBody & Timestamp & {
  finished_at: string
}

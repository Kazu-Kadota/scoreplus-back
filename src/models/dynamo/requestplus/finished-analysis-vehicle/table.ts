import { AnalysisResultEnum, AnalysisTypeEnum, StateEnum } from '../../enums/request'
import { Timestamp } from '../../timestamp'
import { VehicleRequestForms } from '../analysis-vehicle/forms'
import { VehicleAnalysisStatus } from '../analysis-vehicle/status'
import { VehicleAnalysisOptionsRequest, VehicleAnalysisOptionsRequestValueAnswer } from '../analysis-vehicle/vehicle-analysis-options'
import { VehicleAnalysisType } from '../analysis-vehicle/vehicle-analysis-type'
import { M2VehicleAnalysisResponse } from '~/models/m2system/request/analysis-vehicle'

export type SendAnswerVehiclePath = {
  vehicle_id: string
}

export type SendAnswerVehicleBody = VehicleAnalysisOptionsRequestValueAnswer & {
  region?: StateEnum
}

export type RequestplusFinishedAnalysisVehicleKey = {
  request_id: string
  vehicle_id: string
}

export type RequestplusFinishedAnalysisVehicleBody = VehicleRequestForms & {
  already_consulted?: boolean
  analysis_type: AnalysisTypeEnum
  combo_id?: string
  combo_number?: number
  company_name: string
  m2_request?: M2VehicleAnalysisResponse[]
  result: AnalysisResultEnum
  status: VehicleAnalysisStatus<true>
  user_id: string
  vehicle_analysis_options: Partial<VehicleAnalysisOptionsRequest<true>>
  vehicle_analysis_type: VehicleAnalysisType
}

export type RequestplusFinishedAnalysisVehicle = RequestplusFinishedAnalysisVehicleKey & RequestplusFinishedAnalysisVehicleBody & Timestamp & {
  finished_at: string
}

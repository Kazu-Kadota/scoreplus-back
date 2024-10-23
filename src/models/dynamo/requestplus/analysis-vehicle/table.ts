import { AnalysisTypeEnum } from '../../enums/request'
import { Timestamp } from '../../timestamp'
import { M2VehicleAnalysisResponse } from '~/models/m2system/request/analysis-vehicle'

import { VehicleRequestForms } from './forms'
import { VehicleAnalysisStatus } from './status'
import { VehicleAnalysisOptionsRequest } from './vehicle-analysis-options'
import { VehicleAnalysisType } from './vehicle-analysis-type'

export type RequestVehicleAnalysis = {
  vehicle: VehicleRequestForms
  vehicle_analysis_options: Partial<VehicleAnalysisOptionsRequest<false>>
  vehicle_analysis_type: VehicleAnalysisType
}

export type RequestplusAnalysisVehicleKey = {
  request_id: string
  vehicle_id: string
}

export type RequestplusAnalysisVehicleBody = VehicleRequestForms & {
  analysis_type: AnalysisTypeEnum
  combo_id?: string
  combo_number?: number
  company_name: string
  m2_request?: M2VehicleAnalysisResponse[]
  status: VehicleAnalysisStatus<false>
  user_id: string
  vehicle_analysis_options: Partial<VehicleAnalysisOptionsRequest<false>>
  vehicle_analysis_type: VehicleAnalysisType
}

export type RequestplusAnalysisVehicle = RequestplusAnalysisVehicleKey & RequestplusAnalysisVehicleBody & Timestamp & {}

import { VehicleAnalysisStateEnum } from '../../enums/request'
import { Timestamp } from '../../timestamp'
import { RequestplusAnalysisVehicleBody } from '../analysis-vehicle/table'
import { VehicleAnalysisOptionsRequest } from '../analysis-vehicle/vehicle-analysis-options'

import { VehicleAnalysisInformationValidation, VehicleAnalysisInformationValidationValueAnswer } from './validation-information'

export type SendAnswerVehicleValidationPath = {
  vehicle_id: string
}

export type SendAnswerVehicleValidationBody = VehicleAnalysisInformationValidationValueAnswer & {
  region?: VehicleAnalysisStateEnum
}

export type RequestplusValidateAnalysisVehicleKey = {
  request_id: string
  vehicle_id: string
}

export type RequestplusValidateAnalysisVehicleBody = Omit<RequestplusAnalysisVehicleBody, 'vehicle_analysis_options'> & {
  requested_at: string
  answered_at: string
  information_validation: Partial<VehicleAnalysisInformationValidation<false>>
  vehicle_analysis_options: Partial<VehicleAnalysisOptionsRequest<true>>
}

export type RequestplusValidateAnalysisVehicle = RequestplusValidateAnalysisVehicleKey & RequestplusValidateAnalysisVehicleBody & Timestamp & {}

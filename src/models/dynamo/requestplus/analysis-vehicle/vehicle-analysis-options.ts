import { CompanyRequestVehicleConfigEnum } from '../../enums/company'
import { AnalysisResultEnum } from '../../enums/request'

export type VehicleAnalysisOptionsRequestValueAnswer = {
  answered_at: string
  reason?: string
  result: AnalysisResultEnum
  type: CompanyRequestVehicleConfigEnum
}

export type VehicleAnalysisOptionsRequestValueDefault<Finished extends boolean> = Finished extends true
  ? VehicleAnalysisOptionsRequestValueAnswer
  : Partial<VehicleAnalysisOptionsRequestValueAnswer>

export type VehicleAnalysisOptionsRequest<Finished extends boolean> = {
  [Key in CompanyRequestVehicleConfigEnum]: VehicleAnalysisOptionsRequestValueDefault<Finished>
}

export type VehicleAnalysisOptionsToRequest = Array<CompanyRequestVehicleConfigEnum>

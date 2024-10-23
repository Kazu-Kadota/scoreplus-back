import { CompanyRequestVehicleConfigEnum } from '../../enums/company'
import { AnalysisResultEnum, StateEnum } from '../../enums/request'

export type VehicleAnalysisOptionsRequestValueAnswer = {
  answered_at: string
  reason?: string
  result: AnalysisResultEnum
  type: CompanyRequestVehicleConfigEnum
}

export type VehicleAnalysisOptionsRequestValueHistoryRegion<Finished extends boolean> = Finished extends true
  ? VehicleAnalysisOptionsRequestValueAnswer & { region: StateEnum }
  : Partial<VehicleAnalysisOptionsRequestValueAnswer> & { region: StateEnum }

export type VehicleAnalysisOptionsRequestValueHistory<Finished extends boolean> = {
  regions: Array<VehicleAnalysisOptionsRequestValueHistoryRegion<Finished>>
}

export type VehicleAnalysisOptionsRequestValueDefault<Finished extends boolean> = Finished extends true
  ? VehicleAnalysisOptionsRequestValueAnswer
  : Partial<VehicleAnalysisOptionsRequestValueAnswer>

export type VehicleAnalysisOptionsRequest<Finished extends boolean> = {
  [Key in CompanyRequestVehicleConfigEnum]: Key extends CompanyRequestVehicleConfigEnum.PLATE_HISTORY
  ? VehicleAnalysisOptionsRequestValueHistory<Finished>
  : VehicleAnalysisOptionsRequestValueDefault<Finished>
}

export type VehicleAnalysisOptionsToRequest = Array<CompanyRequestVehicleConfigEnum>

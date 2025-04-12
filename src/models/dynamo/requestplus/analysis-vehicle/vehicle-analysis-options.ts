import { CompanyRequestVehicleConfigEnum } from '../../enums/company'
import { VehicleAnalysisStateEnum } from '../../enums/request'

export type VehicleAnalysisOptionsRequestValueAnswer = {
  answered_at: string
  reason?: string
  type: CompanyRequestVehicleConfigEnum
}

export type VehicleAnalysisOptionsRequestValueHistoryRegion<Finished extends boolean> = Finished extends true
  ? VehicleAnalysisOptionsRequestValueAnswer & { region: VehicleAnalysisStateEnum }
  : Partial<VehicleAnalysisOptionsRequestValueAnswer> & { region: VehicleAnalysisStateEnum }

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

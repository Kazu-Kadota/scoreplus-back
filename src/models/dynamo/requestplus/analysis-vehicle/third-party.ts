import { CompanyRequestVehicleConfigEnum } from '../../enums/company'
import { PlateStateEnum } from '../../enums/request'

export type VehicleAnalysisThirdPartyHistoryRegion = Partial<{
    [Key in PlateStateEnum]: unknown
  }>

export type VehicleAnalysisThirdPartyHistory = {
    regions: Array<VehicleAnalysisThirdPartyHistoryRegion>
  }

export type VehicleAnalysisThirdParty = Partial<{
    [Key in CompanyRequestVehicleConfigEnum]: Key extends CompanyRequestVehicleConfigEnum.PLATE_HISTORY
      ? VehicleAnalysisThirdPartyHistory
      : unknown
  }>

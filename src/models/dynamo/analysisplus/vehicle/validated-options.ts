import { CompanyRequestVehicleConfigEnum } from '../../enums/company'
import { AnalysisResultEnum, VehicleAnalysisStateEnum } from '../../enums/request'
import { Timestamp } from '../../timestamp'

export type VehiclesAnalysisValidatedContent = Timestamp & {
  result: AnalysisResultEnum
  reason?: string
  request_id: string
}

export type VehiclesAnalysisValidatedContentHistory = VehiclesAnalysisValidatedContent & {
  state: VehicleAnalysisStateEnum
}

export type VehiclesAnalysisValidatedOptions = {
  [Key in CompanyRequestVehicleConfigEnum]: Key extends CompanyRequestVehicleConfigEnum.PLATE_HISTORY
  ? Array<VehiclesAnalysisValidatedContentHistory>
  : VehiclesAnalysisValidatedContent
}

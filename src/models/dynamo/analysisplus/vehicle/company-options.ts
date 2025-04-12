import { CompanyRequestVehicleConfigEnum } from '../../enums/company'
import { VehicleAnalysisStateEnum } from '../../enums/request'
import { Timestamp } from '../../timestamp'

export type VehiclesAnalysisCompanyContent = Timestamp & {
  company_names: string[]
  request_id: string
}

export type VehiclesAnalysisCompanyContentHistory = VehiclesAnalysisCompanyContent & {
  state: VehicleAnalysisStateEnum
}

export type VehiclesAnalysisCompanyOptions = {
  [Key in CompanyRequestVehicleConfigEnum]: Key extends CompanyRequestVehicleConfigEnum.PLATE_HISTORY
  ? Array<VehiclesAnalysisCompanyContentHistory>
  : VehiclesAnalysisCompanyContent
}

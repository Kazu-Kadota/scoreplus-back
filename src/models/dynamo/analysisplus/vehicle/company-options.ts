import { CompanyRequestVehicleConfigEnum } from '../../enums/company'
import { Timestamp } from '../../timestamp'

export type VehiclesAnalysisCompanyContent = Timestamp & {
  company_names: string[]
  request_id: string
}

export type VehiclesAnalysisCompanyOptions = {
  [Key in CompanyRequestVehicleConfigEnum]: VehiclesAnalysisCompanyContent
}

import { CompanyRequestVehicleConfigEnum } from '../../enums/company'
import { AnalysisResultEnum } from '../../enums/request'
import { Timestamp } from '../../timestamp'

export type VehiclesAnalysisValidatedContent = Timestamp & {
  result: AnalysisResultEnum
  reason?: string
  request_id: string
}

export type VehiclesAnalysisValidatedOptions = {
  [Key in CompanyRequestVehicleConfigEnum]: VehiclesAnalysisValidatedContent
}

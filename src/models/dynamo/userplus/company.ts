import {
  CompanyPersonAnalysisConfigEnum,
  CompanyRequestPersonConfigEnum,
  CompanyRequestVehicleConfigEnum,
} from '../enums/company'
import { PersonStateEnum } from '../enums/request'
import { Timestamp } from '../timestamp'

export type CompanyPersonAnalysisConfig = Record<CompanyPersonAnalysisConfigEnum, number> & {}

export type CompanyRequestVehicleConfig = Record<CompanyRequestVehicleConfigEnum, boolean>

export type CompanyRequestPersonConfig = {
  [Key in CompanyRequestPersonConfigEnum]: Key extends CompanyRequestPersonConfigEnum.HISTORY
    ? Record<PersonStateEnum, boolean>
    : boolean
}

export type UserplusCompanyKey = {
  company_id: string
}

export type UserplusCompanyBody = {
  cnpj: string
  name: string
  analysis_config: CompanyPersonAnalysisConfig
  request_vehicle_config: CompanyRequestVehicleConfig
  request_person_config: CompanyRequestPersonConfig
}

export type UserplusCompany = UserplusCompanyKey & UserplusCompanyBody & Timestamp & {}

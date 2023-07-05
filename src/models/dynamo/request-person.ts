import { CompanyPersonAnalysisConfigEnum, CompanySystemConfigEnum } from './company'
import {
  AnalysisTypeEnum,
  DriverCategoryEnum,
  PersonAnalysisTypeEnum,
  PersonRegionTypeEnum,
  RequestStatusEnum,
  StateEnum,
} from './request-enum'
import { Timestamp } from './timestamp'

export enum PersonAnalysisStatusGeneralEnum {
  GENERAL = 'general'
}

export interface PersonRequestForms {
  birth_date: string
  category_cnh?: DriverCategoryEnum
  cnh?: string
  company_name?: string
  document: string
  expire_at_cnh?: string
  father_name?: string
  mother_name: string
  name: string
  naturalness?: string
  rg: string
  security_number_cnh?: string
  state_rg: StateEnum
}

export interface PersonAnalysisItems {
  type: PersonAnalysisTypeEnum
  region_types: PersonRegionTypeEnum[]
  regions: StateEnum[]
}

export interface PersonAnalysisConfig {
  type: CompanyPersonAnalysisConfigEnum
}

export interface PersonRequestAnalysis {
  person: PersonRequestForms
  person_analysis: PersonAnalysisItems[]
  person_analysis_config: PersonAnalysisConfig
}

export interface PersonAnalysisStatus extends
  Partial<Record<CompanySystemConfigEnum, RequestStatusEnum>>,
  Record<PersonAnalysisStatusGeneralEnum, RequestStatusEnum>
  {}

export interface PersonRequestKey {
  person_id: string
  request_id: string
}

export interface PersonRequestBody extends PersonRequestForms {
  analysis_type: AnalysisTypeEnum
  combo_id?: string
  combo_number?: number
  company_name: string
  person_analysis_config: PersonAnalysisConfig
  person_analysis_type: PersonAnalysisTypeEnum
  region_type: PersonRegionTypeEnum
  region?: StateEnum
  release_extract_id?: string
  status: PersonAnalysisStatus
  user_id: string
}

export interface PersonRequest extends PersonRequestKey, PersonRequestBody, Timestamp {
  finished_at?: string
  analysis_info?: string
  analysis_result?: string
}

import { M2AnalysisTypeEnum, M2PersonAnalysisTypeEnum, M2PersonRegionTypeEnum } from '../enums/analysis'
import { DriverCategoryEnum, StateEnum } from '~/models/dynamo/enums/request'

export type M2PersonRequestForms = {
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

export type M2PersonAnalysisItems = {
  type: M2PersonAnalysisTypeEnum
  region_types: M2PersonRegionTypeEnum[]
  regions?: StateEnum[]
}

export type M2PersonRequestAnalysisBody = {
  person_analysis: M2PersonAnalysisItems[]
  person: M2PersonRequestForms
}

export type M2PersonRequestAnalysisResponseBody = {
  analysis_type: M2AnalysisTypeEnum
  name: string
  person_id: string
  person_analysis_type: M2PersonAnalysisTypeEnum
  region_type?: M2PersonRegionTypeEnum,
  region?: StateEnum,
  request_id: string
}

export type M2PersonRequestAnalysisResponse = {
  message: string
  person_analyzes: M2PersonRequestAnalysisResponseBody[]
}

import {
  EagleSystemAnalysisTypeEnum,
  EagleSystemDriverCategoryEnum,
  EagleSystemPersonAnalysisTypeEnum,
  EagleSystemPersonRegionTypeEnum,
  EagleSystemRequestStatusEnum,
  EagleSystemStateEnum,
} from '../enums/request-enum'

export type EagleSystemRequestAnalysisPersonForms = {
  birth_date: string
  category_cnh?: EagleSystemDriverCategoryEnum
  cnh?: string
  document: string
  expire_at_cnh?: string
  father_name?: string
  metadata?: Record<any, any>
  mother_name: string
  name: string
  naturalness?: string
  rg: string
  security_number_cnh?: string
  state_rg: EagleSystemStateEnum
  postback?: 'scoreplus'
}

export type EagleSystemRequestAnalysisPersonItems = {
  type: EagleSystemPersonAnalysisTypeEnum
  region_types?: EagleSystemPersonRegionTypeEnum[]
  regions?: EagleSystemStateEnum[]
}

export type EagleSystemRequestAnalysisPersonParams = {
  person_analysis: EagleSystemRequestAnalysisPersonItems[]
  person: EagleSystemRequestAnalysisPersonForms
}

export type EagleSystemRequestAnalysisPersonResponseBody = {
  analysis_type: EagleSystemAnalysisTypeEnum
  name: string
  person_analysis_type: EagleSystemPersonAnalysisTypeEnum
  person_id: string
  region_type?: EagleSystemPersonRegionTypeEnum,
  region?: EagleSystemStateEnum,
  request_id: string
  third_party?: any
}

export type EagleSystemRequestAnalysisPersonResponse = {
  message: string
  person_analyzes: EagleSystemRequestAnalysisPersonResponseBody[]
}

export type EagleSystemPersonRequestKey = {
  person_id: string
  request_id: string
}

export type EagleSystemPersonRequestBody = EagleSystemRequestAnalysisPersonForms & {
  analysis_type: EagleSystemAnalysisTypeEnum
  combo_id?: string
  combo_number?: number
  company_name: string
  person_analysis_type: EagleSystemPersonAnalysisTypeEnum
  region_type?: EagleSystemPersonRegionTypeEnum
  region?: EagleSystemStateEnum
  status: EagleSystemRequestStatusEnum
  third_party?: string
  user_id: string
}

export type EagleSystemPersonRequest = EagleSystemPersonRequestKey & EagleSystemPersonRequestBody & {
  created_at: string
  updated_at: string
  finished_at?: string
  analysis_info?: string
  analysis_result?: string
  from_db?: boolean
}

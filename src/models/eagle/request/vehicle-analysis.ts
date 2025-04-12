import {
  EagleSystemAnalysisTypeEnum,
  EagleSystemPlateStateEnum,
  EagleSystemRequestStatusEnum,
  EagleSystemVehicleAnalysisTypeEnum,
} from '../enums/request-enum'

export type EagleSystemVehicleRequestKey = {
  request_id: string
  vehicle_id: string
}

export type EagleSystemVehicleRequestAnalysisTypeForms = {
  company_name?: string
  metadata?: Record<any, any>
  owner_document: string
  owner_name: string
  plate_state: EagleSystemPlateStateEnum
  plate: string
  postback?: 'scoreplus'
}

export type EagleSystemVehicleAnalysisResponse = {
  request_id: string
  vehicle_id: string
  plate: string
  plate_state: EagleSystemPlateStateEnum
  vehicle_analysis_type: EagleSystemVehicleAnalysisTypeEnum
}

export type EagleSystemRequestAnalysisVehicleResponse = EagleSystemVehicleAnalysisResponse & {
  message: string
}

export type EagleSystemVehicleRequestAnalysisTypeBody = EagleSystemVehicleRequestAnalysisTypeForms & {
  analysis_type: EagleSystemAnalysisTypeEnum
  company_name: string
  status: EagleSystemRequestStatusEnum
  third_party?: any
  user_id: string
  vehicle_analysis_type: Omit<EagleSystemVehicleAnalysisTypeEnum, EagleSystemVehicleAnalysisTypeEnum.VEHICLE_PLATE_HISTORY | EagleSystemVehicleAnalysisTypeEnum.VEHICLE_SECOND_DRIVER>
}

export type EagleSystemVehicleAnalysisTypeRequest = EagleSystemVehicleRequestKey & EagleSystemVehicleRequestAnalysisTypeBody & {
  created_at: string
  updated_at: string
  finished_at?: string
  analysis_info?: string
  analysis_result?: string
  from_db?: boolean
}

export type EagleSystemFinishedVehicleRequestAnalysisTypeBody = EagleSystemVehicleRequestAnalysisTypeBody & {
  created_at: string
  updated_at: string
  finished_at?: string
  analysis_info?: string
  analysis_result?: string
  from_db?: boolean
}

export type EagleSystemFinishedVehicleRequestAnalysisType = EagleSystemVehicleRequestKey & EagleSystemFinishedVehicleRequestAnalysisTypeBody & {}

import {
  AnalysisTypeEnum,
  PlateStateEnum,
  RequestStatusEnum,
} from './request-enum'
import { VehicleAnalysisConfig, VehicleRequestKey } from './request-vehicle'
import { Timestamp } from './timestamp'

export interface VehicleRequestPlateHistoryForms {
  company_name?: string
  owner_document: string
  owner_name: string
  plate_state: PlateStateEnum
  plate: string
}

export interface VehicleRequestPlateHistoryBody extends VehicleRequestPlateHistoryForms {
  analysis_type: AnalysisTypeEnum
  company_name: string
  status: RequestStatusEnum
  user_id: string
  vehicle_analysis_config: VehicleAnalysisConfig
}

export interface VehicleRequestPlateHistoryAnalysis {
  vehicle: VehicleRequestPlateHistoryForms
  vehicle_analysis_config: VehicleAnalysisConfig
}

export interface VehicleRequestPlateHistory extends VehicleRequestKey, VehicleRequestPlateHistoryBody, Timestamp {
  finished_at?: string
  analysis_info?: string
  analysis_result?: string
}

export interface FinishedVehicleRequestPlateHistoryBody extends VehicleRequestPlateHistoryBody, Timestamp {
  finished_at: string
  analysis_info?: string
  analysis_result?: string
}

export interface FinishedVehiclePlateHistoryRequest extends VehicleRequestKey, FinishedVehicleRequestPlateHistoryBody {}

import { M2PlateStateEnum } from '../enums/analysis'
import { VehicleType } from '~/models/dynamo/enums/request'

export type M2VehicleRequestForms = {
  chassis?: string
  company_name?: string
  driver_name?: string
  metadata?: Record<any, any>
  owner_document: string
  owner_name: string
  plate_state: M2PlateStateEnum
  plate: string
  postback?: 'scoreplus'
  renavam?: string
  vehicle_model: string
  vehicle_type: VehicleType
}

export type M2VehicleRequestAnalysisResponse = {
  message: string
  request_id: string
  vehicle_id: string
  company_name: string
  user_id: string
  owner_name: string
  plate: string
}

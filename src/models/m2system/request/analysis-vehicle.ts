import { PlateStateEnum, VehicleType } from '~/models/dynamo/enums/request'

export type M2VehicleRequestForms = {
  chassis?: string
  company_name?: string
  driver_name?: string
  owner_document: string
  owner_name: string
  plate_state: PlateStateEnum
  plate: string
  renavam?: string
  vehicle_model: string
  vehicle_type: VehicleType
}

export type M2VehicleAnalysisResponse = {
  request_id: string
  vehicle_id: string
  company_name: string
  user_id: string
  owner_name: string
  plate: string
}

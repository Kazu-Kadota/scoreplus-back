import { PlateStateEnum, VehicleType } from '../../enums/request'

export interface VehicleRequestForms {
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

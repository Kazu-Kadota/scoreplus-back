import { VehicleRequestForms } from '../../requestplus/analysis-vehicle/forms'
import { Timestamp } from '../../timestamp'

import { VehiclesAnalysisCompanyOptions } from './company-options'
import { VehiclesAnalysisValidatedOptions } from './validated-options'

export type AnalysisplusVehiclesKey = {
  vehicle_id: string
  plate: string
}

export type AnalysisplusVehiclesBody = Omit<VehicleRequestForms, 'driver_name' | 'plate' | 'company_name'> & {
  companies: VehiclesAnalysisCompanyOptions
  validated: VehiclesAnalysisValidatedOptions
  black_list?: boolean
  driver_name?: string[]
}

export type AnalysisplusVehicles = AnalysisplusVehiclesKey & AnalysisplusVehiclesBody & Timestamp

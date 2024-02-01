import { AnalysisplusVehicles } from '~/models/dynamo/analysisplus/vehicle/table'
import { CompanyRequestVehicleConfigEnum } from '~/models/dynamo/enums/company'
import { RequestplusAnalysisVehicle } from '~/models/dynamo/requestplus/analysis-vehicle/table'
import { VehicleAnalysisOptionsRequest } from '~/models/dynamo/requestplus/analysis-vehicle/vehicle-analysis-options'
import removeEmpty from '~/utils/remove-empty'

export type UpdateVehicleConstructor = {
  vehicle: AnalysisplusVehicles
  now: string
  vehicle_analysis_options: Partial<VehicleAnalysisOptionsRequest<true>>
  request_vehicle: RequestplusAnalysisVehicle
}

const updateVehicleConstructor = ({
  now,
  vehicle,
  vehicle_analysis_options,
  request_vehicle,
}: UpdateVehicleConstructor): AnalysisplusVehicles => {
  const driver_name = new Set(vehicle.driver_name)
  if (request_vehicle.driver_name) {
    driver_name.add(request_vehicle.driver_name)
  }

  const vehicle_constructor: AnalysisplusVehicles = {
    ...vehicle,
    chassis: vehicle.chassis ?? request_vehicle.chassis,
    driver_name: Array.from(driver_name),
    renavam: vehicle.renavam ?? request_vehicle.renavam,
    // black_list
  }

  for (const [analysis, value] of Object.entries(vehicle_analysis_options)) {
    const vehicle_analysis = analysis as CompanyRequestVehicleConfigEnum

    if (!vehicle.companies[vehicle_analysis]) {
      vehicle.companies[vehicle_analysis] = {
        company_names: [request_vehicle.company_name],
        created_at: now,
        request_id: request_vehicle.request_id,
        updated_at: now,
      }

      vehicle.validated[vehicle_analysis] = {
        created_at: now,
        request_id: request_vehicle.request_id,
        result: value.result,
        updated_at: now,
        reason: value.reason,
      }
    } else {
      const company_names = new Set(vehicle.companies[vehicle_analysis].company_names)
      company_names.add(request_vehicle.company_name)

      vehicle.companies[vehicle_analysis] = {
        ...vehicle.companies[vehicle_analysis],
        company_names: Array.from(company_names),
        request_id: request_vehicle.request_id,
        updated_at: now,
      }

      vehicle.validated[vehicle_analysis] = {
        ...vehicle.validated[vehicle_analysis],
        request_id: request_vehicle.request_id,
        result: value.result,
        updated_at: now,
        reason: value.reason,
      }
    }
  }

  return removeEmpty(vehicle_constructor)
}

export default updateVehicleConstructor

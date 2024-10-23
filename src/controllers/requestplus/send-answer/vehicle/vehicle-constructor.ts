import { VehiclesAnalysisCompanyOptions } from '~/models/dynamo/analysisplus/vehicle/company-options'
import { AnalysisplusVehicles } from '~/models/dynamo/analysisplus/vehicle/table'
import { VehiclesAnalysisValidatedOptions } from '~/models/dynamo/analysisplus/vehicle/validated-options'
import { CompanyRequestVehicleConfigEnum } from '~/models/dynamo/enums/company'
import { RequestplusAnalysisVehicle } from '~/models/dynamo/requestplus/analysis-vehicle/table'
import { VehicleAnalysisOptionsRequest, VehicleAnalysisOptionsRequestValueAnswer, VehicleAnalysisOptionsRequestValueHistory } from '~/models/dynamo/requestplus/analysis-vehicle/vehicle-analysis-options'
import removeEmpty from '~/utils/remove-empty'

export type VehiclesConstructor = {
  request_vehicle: RequestplusAnalysisVehicle
  vehicle_analysis_options: Partial<VehicleAnalysisOptionsRequest<true>>
  now: string
}

const vehiclesConstructor = ({
  request_vehicle,
  now,
  vehicle_analysis_options,
}: VehiclesConstructor): AnalysisplusVehicles => {
  const company_constructor = {} as VehiclesAnalysisCompanyOptions
  const validated_constructor = {} as VehiclesAnalysisValidatedOptions
  if (vehicle_analysis_options['plate-history']) {
    company_constructor['plate-history'] = []
    validated_constructor['plate-history'] = []
  }

  for (const [analysis, value] of Object.entries(vehicle_analysis_options)) {
    const vehicle_analysis = analysis as CompanyRequestVehicleConfigEnum
    if (vehicle_analysis === CompanyRequestVehicleConfigEnum.PLATE_HISTORY) {
      const plate_history_value = value as VehicleAnalysisOptionsRequestValueHistory<true>
      plate_history_value.regions.forEach((object) => {
        company_constructor[vehicle_analysis].push({
          company_names: [request_vehicle.company_name],
          created_at: now,
          request_id: request_vehicle.request_id,
          state: object.region,
          updated_at: now,
        })

        validated_constructor[vehicle_analysis].push({
          created_at: now,
          request_id: request_vehicle.request_id,
          result: object.result,
          state: object.region,
          updated_at: now,
          reason: object.reason,
        })
      })
    } else {
      const generic_value = value as VehicleAnalysisOptionsRequestValueAnswer
      company_constructor[vehicle_analysis] = {
        company_names: [request_vehicle.company_name],
        created_at: now,
        request_id: request_vehicle.request_id,
        updated_at: now,
      }

      validated_constructor[vehicle_analysis] = {
        created_at: now,
        request_id: request_vehicle.request_id,
        result: generic_value.result,
        updated_at: now,
        reason: generic_value.reason,
      }
    }
  }

  const vehicle_constructor: AnalysisplusVehicles = removeEmpty({
    chassis: request_vehicle.chassis,
    companies: company_constructor,
    created_at: now,
    driver_name: request_vehicle.driver_name ? [request_vehicle.driver_name] : undefined,
    owner_document: request_vehicle.owner_document,
    owner_name: request_vehicle.owner_name,
    plate_state: request_vehicle.plate_state,
    plate: request_vehicle.plate,
    renavam: request_vehicle.renavam,
    updated_at: now,
    validated: validated_constructor,
    vehicle_id: request_vehicle.vehicle_id,
    vehicle_model: request_vehicle.vehicle_model,
    vehicle_type: request_vehicle.vehicle_type,
    // black_list,
  })

  return vehicle_constructor
}

export default vehiclesConstructor

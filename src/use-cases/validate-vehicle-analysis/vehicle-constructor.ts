import { VehiclesAnalysisCompanyOptions } from '~/models/dynamo/analysisplus/vehicle/company-options'
import { AnalysisplusVehicles } from '~/models/dynamo/analysisplus/vehicle/table'
import { VehiclesAnalysisValidatedOptions } from '~/models/dynamo/analysisplus/vehicle/validated-options'
import { CompanyRequestVehicleConfigEnum } from '~/models/dynamo/enums/company'
import { RequestplusValidateAnalysisVehicle } from '~/models/dynamo/requestplus/validate-analysis-vehicle/table'
import {
  VehicleAnalysisInformationValidation,
  VehicleAnalysisInformationValidationHistory,
  VehicleAnalysisInformationValidationValueAnswer,
} from '~/models/dynamo/requestplus/validate-analysis-vehicle/validation-information'
import removeEmpty from '~/utils/remove-empty'

export type VehiclesConstructor = {
  validate_request_vehicle: RequestplusValidateAnalysisVehicle
  vehicle_information_validation: Partial<VehicleAnalysisInformationValidation<true>>
  now: string
}

const vehiclesConstructor = ({
  validate_request_vehicle,
  now,
  vehicle_information_validation,
}: VehiclesConstructor): AnalysisplusVehicles => {
  const company_constructor = {} as VehiclesAnalysisCompanyOptions
  const validated_constructor = {} as VehiclesAnalysisValidatedOptions
  if (vehicle_information_validation['plate-history']) {
    company_constructor['plate-history'] = []
    validated_constructor['plate-history'] = []
  }

  for (const [analysis, value] of Object.entries(vehicle_information_validation)) {
    const vehicle_analysis = analysis as CompanyRequestVehicleConfigEnum
    if (vehicle_analysis === CompanyRequestVehicleConfigEnum.PLATE_HISTORY) {
      const plate_history_value = value as VehicleAnalysisInformationValidationHistory<true>
      plate_history_value.regions.forEach((object) => {
        company_constructor[vehicle_analysis].push({
          company_names: [validate_request_vehicle.company_name],
          created_at: now,
          request_id: validate_request_vehicle.request_id,
          state: object.region,
          updated_at: now,
        })

        validated_constructor[vehicle_analysis].push({
          created_at: now,
          request_id: validate_request_vehicle.request_id,
          result: object.result,
          state: object.region,
          updated_at: now,
          reason: object.reason,
        })
      })
    } else {
      const generic_value = value as VehicleAnalysisInformationValidationValueAnswer
      company_constructor[vehicle_analysis] = {
        company_names: [validate_request_vehicle.company_name],
        created_at: now,
        request_id: validate_request_vehicle.request_id,
        updated_at: now,
      }

      validated_constructor[vehicle_analysis] = {
        created_at: now,
        request_id: validate_request_vehicle.request_id,
        result: generic_value.result,
        updated_at: now,
        reason: generic_value.reason,
      }
    }
  }

  const vehicle_constructor: AnalysisplusVehicles = removeEmpty({
    chassis: validate_request_vehicle.chassis,
    companies: company_constructor,
    created_at: now,
    driver_name: validate_request_vehicle.driver_name ? [validate_request_vehicle.driver_name] : undefined,
    owner_document: validate_request_vehicle.owner_document,
    owner_name: validate_request_vehicle.owner_name,
    plate_state: validate_request_vehicle.plate_state,
    plate: validate_request_vehicle.plate,
    renavam: validate_request_vehicle.renavam,
    updated_at: now,
    validated: validated_constructor,
    vehicle_id: validate_request_vehicle.vehicle_id,
    vehicle_model: validate_request_vehicle.vehicle_model,
    vehicle_type: validate_request_vehicle.vehicle_type,
    // black_list,
  })

  return vehicle_constructor
}

export default vehiclesConstructor

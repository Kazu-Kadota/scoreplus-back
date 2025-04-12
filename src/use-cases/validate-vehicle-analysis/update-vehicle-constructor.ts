import { AnalysisplusVehicles } from '~/models/dynamo/analysisplus/vehicle/table'
import { CompanyRequestVehicleConfigEnum } from '~/models/dynamo/enums/company'
import { RequestplusValidateAnalysisVehicle } from '~/models/dynamo/requestplus/validate-analysis-vehicle/table'
import { VehicleAnalysisInformationValidation, VehicleAnalysisInformationValidationHistory, VehicleAnalysisInformationValidationValueAnswer } from '~/models/dynamo/requestplus/validate-analysis-vehicle/validation-information'
import InternalServerError from '~/utils/errors/500-internal-server-error'
import logger from '~/utils/logger'
import removeEmpty from '~/utils/remove-empty'

export type UpdateVehicleConstructor = {
  vehicle: AnalysisplusVehicles
  now: string
  vehicle_information_validation: Partial<VehicleAnalysisInformationValidation<true>>
  validate_request_vehicle: RequestplusValidateAnalysisVehicle
}

const updateVehicleConstructor = ({
  now,
  vehicle,
  vehicle_information_validation,
  validate_request_vehicle,
}: UpdateVehicleConstructor): AnalysisplusVehicles => {
  const driver_name = new Set(vehicle.driver_name)
  if (validate_request_vehicle.driver_name) {
    driver_name.add(validate_request_vehicle.driver_name)
  }

  const vehicle_constructor: AnalysisplusVehicles = {
    ...vehicle,
    chassis: vehicle.chassis ?? validate_request_vehicle.chassis,
    driver_name: Array.from(driver_name),
    renavam: vehicle.renavam ?? validate_request_vehicle.renavam,
    // black_list
  }

  for (const [analysis, value] of Object.entries(vehicle_information_validation)) {
    const vehicle_analysis = analysis as CompanyRequestVehicleConfigEnum

    if (vehicle_analysis === CompanyRequestVehicleConfigEnum.PLATE_HISTORY) {
      const historical_value = value as VehicleAnalysisInformationValidationHistory<true>
      historical_value.regions.forEach((object) => {
        if (!vehicle.companies['plate-history']) {
          vehicle.companies['plate-history'] = []
        }

        if (!vehicle.validated['plate-history']) {
          vehicle.validated['plate-history'] = []
        }

        const exist_region = vehicle.companies['plate-history'].find((value) =>
          value.state === object.region,
        )

        if (!exist_region) {
          vehicle.companies['plate-history'].push({
            company_names: [validate_request_vehicle.company_name],
            created_at: now,
            request_id: validate_request_vehicle.request_id,
            state: object.region,
            updated_at: now,
          })

          vehicle.validated['plate-history'].push({
            created_at: now,
            request_id: validate_request_vehicle.request_id,
            result: object.result,
            state: object.region,
            updated_at: now,
            reason: object.reason,
          })
        } else {
          const region_index = vehicle.companies['plate-history'].findIndex((value) =>
            value.state === object.region,
          )
          const company_names = new Set(vehicle.companies['plate-history'][region_index].company_names)
          company_names.add(validate_request_vehicle.company_name)

          vehicle.companies['plate-history'][region_index] = {
            ...vehicle.companies['plate-history'][region_index],
            company_names: Array.from(company_names),
            request_id: validate_request_vehicle.request_id,
            updated_at: now,
          }

          vehicle.validated['plate-history'][region_index] = {
            ...vehicle.validated['plate-history'][region_index],
            request_id: validate_request_vehicle.request_id,
            result: object.result,
            updated_at: now,
            reason: object.reason,
          }
        }
      })
    } else {
      const generic_value = value as VehicleAnalysisInformationValidationValueAnswer

      if (!vehicle.companies[vehicle_analysis] && !vehicle.validated[vehicle_analysis]) {
        vehicle.companies[vehicle_analysis] = {
          company_names: [validate_request_vehicle.company_name],
          created_at: now,
          request_id: validate_request_vehicle.request_id,
          updated_at: now,
        }

        vehicle.validated[vehicle_analysis] = {
          created_at: now,
          request_id: validate_request_vehicle.request_id,
          result: generic_value.result,
          updated_at: now,
          reason: generic_value.reason,
        }
      } else if (vehicle.companies[vehicle_analysis] && vehicle.validated[vehicle_analysis]) {
        // @ts-ignore-next-line
        const company_names = new Set(vehicle.companies[vehicle_analysis].company_names)
        company_names.add(validate_request_vehicle.company_name)

        // @ts-ignore-next-line
        vehicle.companies[vehicle_analysis] = {
          ...vehicle.companies[vehicle_analysis],
          company_names: Array.from(company_names),
          request_id: validate_request_vehicle.request_id,
          updated_at: now,
        }

        // @ts-ignore-next-line
        vehicle.validated[vehicle_analysis] = {
          ...vehicle.validated[vehicle_analysis],
          request_id: validate_request_vehicle.request_id,
          result: generic_value.result,
          updated_at: now,
          reason: generic_value.reason,
        }
      } else {
        logger.warn({
          message: 'One of vehicle.companies or vehicle.validated not exist',
          company: vehicle.companies[vehicle_analysis],
          validated: vehicle.validated[vehicle_analysis],
        })

        throw new InternalServerError('Verificar Vehicle')
      }
    }
  }

  return removeEmpty(vehicle_constructor)
}

export default updateVehicleConstructor

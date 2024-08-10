import { AnalysisplusVehicles } from '~/models/dynamo/analysisplus/vehicle/table'
import { CompanyRequestVehicleConfigEnum } from '~/models/dynamo/enums/company'
import { RequestplusAnalysisVehicle } from '~/models/dynamo/requestplus/analysis-vehicle/table'
import { VehicleAnalysisOptionsRequest, VehicleAnalysisOptionsRequestValueAnswer, VehicleAnalysisOptionsRequestValueHistory } from '~/models/dynamo/requestplus/analysis-vehicle/vehicle-analysis-options'
import InternalServerError from '~/utils/errors/500-internal-server-error'
import logger from '~/utils/logger'
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

    if (vehicle_analysis === CompanyRequestVehicleConfigEnum.PLATE_HISTORY) {
      const historical_value = value as VehicleAnalysisOptionsRequestValueHistory<true>
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
            company_names: [request_vehicle.company_name],
            created_at: now,
            request_id: request_vehicle.request_id,
            state: object.region,
            updated_at: now,
          })

          vehicle.validated['plate-history'].push({
            created_at: now,
            request_id: request_vehicle.request_id,
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
          company_names.add(request_vehicle.company_name)

          vehicle.companies['plate-history'][region_index] = {
            ...vehicle.companies['plate-history'][region_index],
            company_names: Array.from(company_names),
            request_id: request_vehicle.request_id,
            updated_at: now,
          }

          vehicle.validated['plate-history'][region_index] = {
            ...vehicle.validated['plate-history'][region_index],
            request_id: request_vehicle.request_id,
            result: object.result,
            updated_at: now,
            reason: object.reason,
          }
        }
      })
    } else {
      const generic_value = value as VehicleAnalysisOptionsRequestValueAnswer

      if (!vehicle.companies[vehicle_analysis] && !vehicle.validated[vehicle_analysis]) {
        vehicle.companies[vehicle_analysis] = {
          company_names: [request_vehicle.company_name],
          created_at: now,
          request_id: request_vehicle.request_id,
          updated_at: now,
        }

        vehicle.validated[vehicle_analysis] = {
          created_at: now,
          request_id: request_vehicle.request_id,
          result: generic_value.result,
          updated_at: now,
          reason: generic_value.reason,
        }
      } else if (vehicle.companies[vehicle_analysis] && vehicle.validated[vehicle_analysis]) {
        // @ts-ignore
        const company_names = new Set(vehicle.companies[vehicle_analysis].company_names)
        company_names.add(request_vehicle.company_name)

        // @ts-ignore
        vehicle.companies[vehicle_analysis] = {
          ...vehicle.companies[vehicle_analysis],
          company_names: Array.from(company_names),
          request_id: request_vehicle.request_id,
          updated_at: now,
        }

        // @ts-ignore
        vehicle.validated[vehicle_analysis] = {
          ...vehicle.validated[vehicle_analysis],
          request_id: request_vehicle.request_id,
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

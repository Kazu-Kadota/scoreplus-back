import { CompanyRequestVehicleConfigEnum } from '~/models/dynamo/enums/company'
import { StateEnum } from '~/models/dynamo/enums/request'
import { VehicleAnalysisOptionsRequest, VehicleAnalysisOptionsToRequest } from '~/models/dynamo/requestplus/analysis-vehicle/vehicle-analysis-options'
import { CompanyRequestVehicleConfig } from '~/models/dynamo/userplus/company'
import BadRequestError from '~/utils/errors/400-bad-request'
import InternalServerError from '~/utils/errors/500-internal-server-error'
import logger from '~/utils/logger'

const vehicleAnalysisOptionsConstructor = (
  vehicle_analysis_options_to_request: VehicleAnalysisOptionsToRequest,
  request_vehicle_config: CompanyRequestVehicleConfig,
): Partial<VehicleAnalysisOptionsRequest<false>> => {
  const vehicle_analysis_options: Partial<VehicleAnalysisOptionsRequest<false>> = {}
  const invalid_request_set = new Set<CompanyRequestVehicleConfigEnum>()
  const invalid_regions: Array<StateEnum> = []

  for (const analysis_to_request of vehicle_analysis_options_to_request) {
    if (analysis_to_request === CompanyRequestVehicleConfigEnum.PLATE_HISTORY) {
      vehicle_analysis_options[analysis_to_request] = { regions: [] }
      const company_request_vehicle_config_history = Object.entries(request_vehicle_config[CompanyRequestVehicleConfigEnum.PLATE_HISTORY])

      if (company_request_vehicle_config_history.length === 0) {
        logger.warn({
          message: 'Company selected plate history but does not have states',
          request_vehicle_config,
        })

        throw new InternalServerError('Empresa selecionou histórico de placa mas não há estados', {
          request_vehicle_config,
        })
      }

      for (const [history_regions, to_be_analyzed] of company_request_vehicle_config_history) {
        const region = history_regions as StateEnum
        if (to_be_analyzed) {
          vehicle_analysis_options[analysis_to_request]!.regions.push({
            region,
          })
        } else {
          invalid_request_set.add(analysis_to_request)
          invalid_regions.push(region)
        }
      }
    } else {
      if (request_vehicle_config[analysis_to_request]) {
        vehicle_analysis_options[analysis_to_request] = {}
      } else {
        invalid_request_set.add(analysis_to_request)
      }
    }
  }

  if (invalid_request_set.size !== 0) {
    const invalid_request = Array.from(invalid_request_set)
    logger.warn({
      message: 'Company not allowed to request analysis to the selected options',
      invalid_request,
      invalid_regions,
    })

    throw new BadRequestError('Empresa não autorizado para solicitar análise para as seguintes opções', {
      invalid_request,
      invalid_regions,
    })
  }

  return vehicle_analysis_options
}

export default vehicleAnalysisOptionsConstructor

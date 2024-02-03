import { CompanyRequestVehicleConfigEnum } from '~/models/dynamo/enums/company'
import { VehicleAnalysisOptionsRequest, VehicleAnalysisOptionsToRequest } from '~/models/dynamo/requestplus/analysis-vehicle/vehicle-analysis-options'
import { CompanyRequestVehicleConfig } from '~/models/dynamo/userplus/company'
import BadRequestError from '~/utils/errors/400-bad-request'
import logger from '~/utils/logger'

const vehicleAnalysisOptionsConstructor = (
  vehicle_analysis_options_to_request: VehicleAnalysisOptionsToRequest,
  request_vehicle_config: CompanyRequestVehicleConfig,
): Partial<VehicleAnalysisOptionsRequest<false>> => {
  const vehicle_analysis_options: Partial<VehicleAnalysisOptionsRequest<false>> = {}
  const invalid_request_set = new Set<CompanyRequestVehicleConfigEnum>()

  for (const analysis_to_request of vehicle_analysis_options_to_request) {
    if (request_vehicle_config[analysis_to_request]) {
      vehicle_analysis_options[analysis_to_request] = {}
    } else {
      invalid_request_set.add(analysis_to_request)
    }
  }

  if (invalid_request_set.size !== 0) {
    const invalid_request = Array.from(invalid_request_set)
    logger.warn({
      message: 'Company not allowed to request analysis to the selected options',
      invalid_request,
    })

    throw new BadRequestError('Empresa não autorizado para solicitar análise para as seguintes opções', {
      invalid_request,
    })
  }

  return vehicle_analysis_options
}

export default vehicleAnalysisOptionsConstructor

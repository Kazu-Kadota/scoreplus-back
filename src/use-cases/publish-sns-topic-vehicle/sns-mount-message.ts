import { CompanyRequestVehicleConfigEnum } from '~/models/dynamo/enums/company'
import { VehicleRequestForms } from '~/models/dynamo/requestplus/analysis-vehicle/forms'
import { VehicleAnalysisOptionsRequest } from '~/models/dynamo/requestplus/analysis-vehicle/vehicle-analysis-options'
import logger from '~/utils/logger'

import eagleSystemRequestConstructor from './eagle-system-request-constructor'
import M2SystemEthicalAnalysisConstructor from './m2-ethical-analysis-constructor'
import M2SystemPlateHistoryAnalysisConstructor from './m2-plate-history-analysis-constructor'

export type VehicleSnsMountMessageParams = {
  company_vehicle_analysis_options: Partial<VehicleAnalysisOptionsRequest<false>>,
  request_id: string
  vehicle_analysis_option: CompanyRequestVehicleConfigEnum,
  vehicle_data: VehicleRequestForms,
  vehicle_id: string
}

const vehicleSnsMountMessage = ({
  company_vehicle_analysis_options,
  request_id,
  vehicle_analysis_option,
  vehicle_data,
  vehicle_id,
}: VehicleSnsMountMessageParams) => {
  switch (vehicle_analysis_option) {
    case CompanyRequestVehicleConfigEnum.ANTT:
      return eagleSystemRequestConstructor({
        request_id,
        vehicle_analysis_option,
        vehicle_data,
        vehicle_id,
      })
    case CompanyRequestVehicleConfigEnum.CRONOTACOGRAFO:
      return undefined
    case CompanyRequestVehicleConfigEnum.BASIC_DATA:
      return eagleSystemRequestConstructor({
        request_id,
        vehicle_analysis_option,
        vehicle_data,
        vehicle_id,
      })
    case CompanyRequestVehicleConfigEnum.ETHICAL:
      return M2SystemEthicalAnalysisConstructor({
        request_id,
        vehicle_analysis_option,
        vehicle_data,
        vehicle_id,
      })
    case CompanyRequestVehicleConfigEnum.PLATE_HISTORY:
      return company_vehicle_analysis_options['plate-history']?.regions.map((region) => {
        return M2SystemPlateHistoryAnalysisConstructor({
          request_id,
          vehicle_analysis_option,
          vehicle_data,
          vehicle_id,
          region: region.region,
        })
      })
    default:
      logger.warn({
        message: 'There is no option in vehicle analysis options to mount sns message',
        vehicle_analysis_options: vehicle_analysis_option,
      })
      return undefined
  }
}

export default vehicleSnsMountMessage

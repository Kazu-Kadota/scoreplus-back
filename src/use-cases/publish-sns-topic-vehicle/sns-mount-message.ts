import { CompanyRequestVehicleConfigEnum } from '~/models/dynamo/enums/company'
import { VehicleRequestForms } from '~/models/dynamo/requestplus/analysis-vehicle/forms'
import logger from '~/utils/logger'

import anttConstructor from './antt-constructor'

export type VehicleSnsMountMessageParams = {
  vehicle_analysis_option: CompanyRequestVehicleConfigEnum,
  vehicle_data: VehicleRequestForms,
}

const vehicleSnsMountMessage = ({
  vehicle_analysis_option,
  vehicle_data,
}: VehicleSnsMountMessageParams) => {
  switch (vehicle_analysis_option) {
    case CompanyRequestVehicleConfigEnum.ANTT:
      return anttConstructor(vehicle_data)
    case CompanyRequestVehicleConfigEnum.CRONOTACOGRAFO:
      return undefined
    default:
      logger.warn({
        message: 'There is no option in vehicle analysis options to mount sns message',
        vehicle_analysis_options: vehicle_analysis_option,
      })
      return undefined
  }
}

export default vehicleSnsMountMessage

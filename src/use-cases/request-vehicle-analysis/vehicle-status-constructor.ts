import { CompanyRequestVehicleConfigEnum } from '~/models/dynamo/enums/company'
import { RequestStatusEnum } from '~/models/dynamo/enums/request'
import { VehicleAnalysisStatus } from '~/models/dynamo/requestplus/analysis-vehicle/status'
import { VehicleAnalysisOptionsRequest } from '~/models/dynamo/requestplus/analysis-vehicle/vehicle-analysis-options'

const vehicleStatusConstructor = (
  vehicle_analysis_options: Partial<VehicleAnalysisOptionsRequest<false>>,
): VehicleAnalysisStatus<false> => {
  const status = {
    general: RequestStatusEnum.WAITING,
  } as VehicleAnalysisStatus<false>

  for (const analysis of Object.keys(vehicle_analysis_options)) {
    const analysis_key = analysis as CompanyRequestVehicleConfigEnum
    status[analysis_key] = RequestStatusEnum.WAITING
  }

  return status
}

export default vehicleStatusConstructor

import { CompanyRequestVehicleConfigEnum } from '~/models/dynamo/enums/company'
import { RequestStatusEnum } from '~/models/dynamo/enums/request'
import { VehicleAnalysisStatus } from '~/models/dynamo/requestplus/analysis-vehicle/status'
import { VehicleAnalysisOptionsRequest, VehicleAnalysisOptionsRequestValueHistory } from '~/models/dynamo/requestplus/analysis-vehicle/vehicle-analysis-options'

const vehicleStatusConstructor = (
  vehicle_analysis_options: Partial<VehicleAnalysisOptionsRequest<false>>,
): VehicleAnalysisStatus<false> => {
  const status = CompanyRequestVehicleConfigEnum.PLATE_HISTORY in vehicle_analysis_options
    ? {
      'plate-history': {
        regions: [],
      },
      general: RequestStatusEnum.WAITING,
    } as VehicleAnalysisStatus<false>
    : {
      general: RequestStatusEnum.WAITING,
    } as VehicleAnalysisStatus<false>

  for (const [analysis, object] of Object.entries(vehicle_analysis_options)) {
    const analysis_key = analysis as CompanyRequestVehicleConfigEnum
    if (analysis_key === CompanyRequestVehicleConfigEnum.PLATE_HISTORY) {
      const object_value = object as VehicleAnalysisOptionsRequestValueHistory<false>
      for (const { region } of object_value.regions) {
        status[CompanyRequestVehicleConfigEnum.PLATE_HISTORY]?.regions.push(
          {
            [region]: RequestStatusEnum.WAITING,
          },
        )
      }
    } else if (analysis_key === CompanyRequestVehicleConfigEnum.ETHICAL) {
      status[analysis_key] = RequestStatusEnum.WAITING
    } else {
      status[analysis_key] = RequestStatusEnum.PROCESSING
    }
  }

  return status
}

export default vehicleStatusConstructor

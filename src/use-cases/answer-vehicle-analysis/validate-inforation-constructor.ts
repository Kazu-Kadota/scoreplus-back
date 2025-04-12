import { CompanyRequestVehicleConfigEnum } from '~/models/dynamo/enums/company'
import {
  VehicleAnalysisOptionsRequest,
  VehicleAnalysisOptionsRequestValueHistory,
} from '~/models/dynamo/requestplus/analysis-vehicle/vehicle-analysis-options'
import { VehicleAnalysisInformationValidation } from '~/models/dynamo/requestplus/validate-analysis-vehicle/validation-information'

export type InformationValidationConstructorParams = {
  vehicle_analysis_options: Partial<VehicleAnalysisOptionsRequest<true>>,
}

const informationValidationConstructor = ({
  vehicle_analysis_options,
}: InformationValidationConstructorParams): VehicleAnalysisInformationValidation<false> => {
  const information_validation: VehicleAnalysisInformationValidation<false> = CompanyRequestVehicleConfigEnum.PLATE_HISTORY in vehicle_analysis_options
    ? {
      'plate-history': {
        regions: [],
      },
    } as VehicleAnalysisInformationValidation<false>
    : {
    } as VehicleAnalysisInformationValidation<false>

  for (const [analysis, object] of Object.entries(vehicle_analysis_options)) {
    const analysis_key = analysis as CompanyRequestVehicleConfigEnum
    if (analysis_key === CompanyRequestVehicleConfigEnum.PLATE_HISTORY) {
      const object_value = object as VehicleAnalysisOptionsRequestValueHistory<true>
      for (const { region } of object_value.regions) {
        information_validation[CompanyRequestVehicleConfigEnum.PLATE_HISTORY]?.regions.push(
          {
            region,
          },
        )
      }
    } else {
      information_validation[analysis_key] = {}
    }
  }

  return information_validation
}

export default informationValidationConstructor

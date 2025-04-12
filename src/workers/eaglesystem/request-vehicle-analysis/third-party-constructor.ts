import { eagleSystemScoreplusVehicleConfigMap } from '~/constants/scoreplus-eagle-system-map'
import { CompanyRequestVehicleConfigEnum } from '~/models/dynamo/enums/company'
import { RequestplusAnalysisVehicle } from '~/models/dynamo/requestplus/analysis-vehicle/table'
import { EagleSystemRequestAnalysisVehicleResponse } from '~/models/eagle/request/vehicle-analysis'

export type ThirdPartyConstructorParams = {
  eagle_request_vehicle_analysis: EagleSystemRequestAnalysisVehicleResponse
  request_vehicle: RequestplusAnalysisVehicle
}

function thirdPartyConstructor ({
  eagle_request_vehicle_analysis,
  request_vehicle,
}: ThirdPartyConstructorParams) {
  const third_party = request_vehicle.third_party ? request_vehicle.third_party : {}

  // @ts-ignore-next-line
  third_party[eagleSystemScoreplusVehicleConfigMap[request_vehicle.vehicle_analysis_type] as CompanyRequestVehicleConfigEnum] = eagle_request_vehicle_analysis

  return third_party
}

export default thirdPartyConstructor

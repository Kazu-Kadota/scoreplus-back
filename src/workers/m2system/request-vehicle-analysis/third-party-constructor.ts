import { m2SystemScoreplusVehicleConfigMap } from '~/constants/scoreplus-m2-system-map'
import { CompanyRequestVehicleConfigEnum } from '~/models/dynamo/enums/company'
import { RequestplusAnalysisVehicle } from '~/models/dynamo/requestplus/analysis-vehicle/table'
import { M2VehicleRequestAnalysisResponse } from '~/models/m2system/request/analysis-vehicle'

export type ThirdPartyConstructorParams = {
  m2_request_vehicle_analysis: M2VehicleRequestAnalysisResponse
  request_vehicle: RequestplusAnalysisVehicle
}

function thirdPartyConstructor ({
  m2_request_vehicle_analysis,
  request_vehicle,
}: ThirdPartyConstructorParams) {
  const third_party = request_vehicle.third_party ? request_vehicle.third_party : {}

  // @ts-ignore-next-line
  third_party[m2SystemScoreplusVehicleConfigMap[request_vehicle.vehicle_analysis_type] as CompanyRequestVehicleConfigEnum] = m2_request_vehicle_analysis

  return third_party
}

export default thirdPartyConstructor

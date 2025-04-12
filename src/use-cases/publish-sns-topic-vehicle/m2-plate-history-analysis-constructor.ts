import { CompanyRequestVehicleConfigEnum } from '~/models/dynamo/enums/company'
import { VehicleAnalysisStateEnum } from '~/models/dynamo/enums/request'
import { VehicleRequestForms } from '~/models/dynamo/requestplus/analysis-vehicle/forms'
import { M2PlateStateEnum, M2RequestAnalysisStateEnum } from '~/models/m2system/enums/analysis'
import { M2VehicleRequestPlateHistoryForms } from '~/models/m2system/request/analysis-vehicle-plate-history'

export type M2SystemPlateHistoryAnalysisConstructorResponse = {
  data: M2VehicleRequestPlateHistoryForms
  vehicle_analysis_option: CompanyRequestVehicleConfigEnum
}

export type M2SystemPlateHistoryAnalysisConstructorParams = {
  request_id: string
  vehicle_analysis_option: CompanyRequestVehicleConfigEnum
  vehicle_data: VehicleRequestForms,
  vehicle_id: string
  region: VehicleAnalysisStateEnum
}

const M2SystemPlateHistoryAnalysisConstructor = ({
  request_id,
  vehicle_analysis_option,
  vehicle_data,
  vehicle_id,
  region,
}: M2SystemPlateHistoryAnalysisConstructorParams): M2SystemPlateHistoryAnalysisConstructorResponse => ({
  data: {
    metadata: {
      vehicle_id,
      request_id,
    },
    owner_document: vehicle_data.owner_document,
    owner_name: vehicle_data.owner_name,
    plate_state: vehicle_data.plate_state as unknown as M2PlateStateEnum,
    plate: vehicle_data.plate,
    postback: 'scoreplus',
    region: region as unknown as M2RequestAnalysisStateEnum,
  },
  vehicle_analysis_option,
})

export default M2SystemPlateHistoryAnalysisConstructor

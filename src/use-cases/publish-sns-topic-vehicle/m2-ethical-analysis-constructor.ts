import { CompanyRequestVehicleConfigEnum } from '~/models/dynamo/enums/company'
import { VehicleRequestForms } from '~/models/dynamo/requestplus/analysis-vehicle/forms'
import { M2PlateStateEnum } from '~/models/m2system/enums/analysis'
import { M2VehicleRequestForms } from '~/models/m2system/request/analysis-vehicle'

export type M2SystemEthicalAnalysisConstructorResponse = {
  data: M2VehicleRequestForms
  vehicle_analysis_option: CompanyRequestVehicleConfigEnum
}

export type M2SystemEthicalAnalysisConstructorParams = {
  request_id: string
  vehicle_analysis_option: CompanyRequestVehicleConfigEnum
  vehicle_data: VehicleRequestForms,
  vehicle_id: string
}

const M2SystemEthicalAnalysisConstructor = ({
  request_id,
  vehicle_analysis_option,
  vehicle_data,
  vehicle_id,
}: M2SystemEthicalAnalysisConstructorParams): M2SystemEthicalAnalysisConstructorResponse => ({
  data: {
    chassis: vehicle_data.chassis,
    driver_name: vehicle_data.driver_name,
    metadata: {
      vehicle_id,
      request_id,
    },
    owner_document: vehicle_data.owner_document,
    owner_name: vehicle_data.owner_name,
    plate_state: vehicle_data.plate_state as unknown as M2PlateStateEnum,
    plate: vehicle_data.plate,
    postback: 'scoreplus',
    renavam: vehicle_data.renavam,
    vehicle_model: vehicle_data.vehicle_model,
    vehicle_type: vehicle_data.vehicle_type,
  },
  vehicle_analysis_option,
})

export default M2SystemEthicalAnalysisConstructor

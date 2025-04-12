import { CompanyRequestVehicleConfigEnum } from '~/models/dynamo/enums/company'
import { VehicleRequestForms } from '~/models/dynamo/requestplus/analysis-vehicle/forms'
import { EagleSystemPlateStateEnum } from '~/models/eagle/enums/request-enum'
import { EagleSystemVehicleRequestAnalysisTypeForms } from '~/models/eagle/request/vehicle-analysis'

export type EagleSystemRequestConstructorResponse = {
  data: EagleSystemVehicleRequestAnalysisTypeForms
  vehicle_analysis_option: CompanyRequestVehicleConfigEnum
}

export type EagleSystemRequestConstructorParams = {
  request_id: string
  vehicle_analysis_option: CompanyRequestVehicleConfigEnum
  vehicle_data: VehicleRequestForms,
  vehicle_id: string
}

const eagleSystemRequestConstructor = ({
  request_id,
  vehicle_analysis_option,
  vehicle_data,
  vehicle_id,
}: EagleSystemRequestConstructorParams): EagleSystemRequestConstructorResponse => ({
  data: {
    metadata: {
      vehicle_id,
      request_id,
    },
    owner_document: vehicle_data.owner_document,
    owner_name: vehicle_data.owner_name,
    plate: vehicle_data.plate,
    plate_state: vehicle_data.plate_state as unknown as EagleSystemPlateStateEnum,
    postback: 'scoreplus',
  },
  vehicle_analysis_option,
})

export default eagleSystemRequestConstructor

import { VehicleRequestForms } from '~/models/dynamo/requestplus/analysis-vehicle/forms'

const anttConstructor = (vehicle_data: VehicleRequestForms) => {
  return {
    key: {
      cpf: vehicle_data.owner_document,
    },
  }
}

export default anttConstructor

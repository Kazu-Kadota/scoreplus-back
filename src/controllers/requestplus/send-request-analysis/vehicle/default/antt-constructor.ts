import { VehicleRequestForms } from 'src/models/dynamo/request-vehicle'

const anttConstructor = (vehicle_data: VehicleRequestForms) => {
  return {
    key: {
      cpf: vehicle_data.owner_document,
    },
  }
}

export default anttConstructor

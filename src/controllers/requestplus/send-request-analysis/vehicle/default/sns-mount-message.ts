import { CompanySystemConfigEnum } from 'src/models/dynamo/company'
import { VehicleRequestForms } from 'src/models/dynamo/request-vehicle'

import anttConstructor from './antt-constructor'

const snsMountMessage = (
  company_system_config: CompanySystemConfigEnum,
  bool: boolean,
  vehicle_data: VehicleRequestForms,
) => {
  switch (company_system_config) {
    case CompanySystemConfigEnum.ANTT:
      if (!bool) break
      return anttConstructor(vehicle_data)
  }

  return undefined
}

export default snsMountMessage

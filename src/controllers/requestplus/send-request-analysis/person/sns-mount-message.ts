import { CompanySystemConfigEnum } from 'src/models/dynamo/company'

import { PersonRequestForms } from 'src/models/dynamo/request-person'

import facialBiometryConstructor from './facial-biometry-constructor'

const snsMountMessage = (
  company_system_config: CompanySystemConfigEnum,
  bool: boolean,
  person_data: PersonRequestForms,
) => {
  switch (company_system_config) {
    case CompanySystemConfigEnum.BIOMETRY:
      if (!bool) break
      return facialBiometryConstructor(person_data)
    case CompanySystemConfigEnum.SERASA:
      if (!bool) break
      return undefined
  }

  return undefined
}

export default snsMountMessage

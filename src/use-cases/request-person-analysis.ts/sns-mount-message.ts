import { CompanyRequestPersonConfigEnum } from '~/models/dynamo/enums/company'
import { PersonRequestForms } from '~/models/dynamo/requestplus/analysis-person/forms'
import logger from '~/utils/logger'

import facialBiometryConstructor from './facial-biometry-constructor'

export type PersonSnsMountMessageParams = {
  person_analysis_option: CompanyRequestPersonConfigEnum,
  person_data: PersonRequestForms,
}

const personSnsMountMessage = ({
  person_analysis_option,
  person_data,
}: PersonSnsMountMessageParams) => {
  switch (person_analysis_option) {
    case CompanyRequestPersonConfigEnum.BIOMETRY:
      return facialBiometryConstructor(person_data)
    case CompanyRequestPersonConfigEnum.CNH_SIMPLE:
      return undefined
    case CompanyRequestPersonConfigEnum.CNH_MEDIUM:
      return undefined
    case CompanyRequestPersonConfigEnum.CNH_ADVANCED:
      return undefined
    default:
      logger.warn({
        message: 'There is no option in person analysis options to mount sns message',
        person_analysis_option,
      })
      return undefined
  }
}

export default personSnsMountMessage

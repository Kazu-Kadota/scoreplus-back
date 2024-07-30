import { DatavalidImageObject } from '~/models/datavalid/image-object'
import { CompanyRequestPersonBiometryConfigEnum, CompanyRequestPersonConfigEnum } from '~/models/dynamo/enums/company'
import { PersonRequestForms } from '~/models/dynamo/requestplus/analysis-person/forms'
import logger from '~/utils/logger'

import pfBasicBiometryConstructor, { PfBasicBiometryConstructorParams } from './pf-basic-biometry-constructor'
import pfFacialBiometryConstructor, { PfFacialBiometryConstructorParams } from './pf-facial-biometry-constructor'
import pfFacialCDVBiometryConstructor, { PfFacialCDVBiometryConstructorParams } from './pf-facial-cdv-biometry-constructor'

export type PersonSnsMountMessageParams = {
  person_analysis_option: CompanyRequestPersonConfigEnum,
  person_data: PersonRequestForms,
  images?: DatavalidImageObject<unknown>
}

const personSnsMountMessage = ({
  person_analysis_option,
  person_data,
  images,
}: PersonSnsMountMessageParams) => {
  switch (person_analysis_option) {
    case CompanyRequestPersonConfigEnum.BIOMETRY_BASIC: {
      const data: PfBasicBiometryConstructorParams = person_data
      return pfBasicBiometryConstructor(data)
    }
    case CompanyRequestPersonConfigEnum.BIOMETRY_FACIAL: {
      const facial_images = images as DatavalidImageObject<CompanyRequestPersonBiometryConfigEnum.BIOMETRY_FACIAL>
      const data: PfFacialBiometryConstructorParams = {
        ...person_data,
        ...facial_images,
      }
      return pfFacialBiometryConstructor(data)
    }
    case CompanyRequestPersonConfigEnum.BIOMETRY_CNH: {
      const facial_images = images as DatavalidImageObject<CompanyRequestPersonBiometryConfigEnum.BIOMETRY_CNH>
      const data: PfFacialCDVBiometryConstructorParams = {
        ...person_data,
        ...facial_images,
      }
      return pfFacialCDVBiometryConstructor(data)
    }
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

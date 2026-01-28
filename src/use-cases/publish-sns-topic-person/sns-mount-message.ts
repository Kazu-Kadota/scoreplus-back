import { DatavalidImageObject } from '~/models/datavalid/image-object'
import { CompanyRequestPersonBiometryConfigEnum, CompanyRequestPersonConfigEnum } from '~/models/dynamo/enums/company'
import { PersonRequestForms } from '~/models/dynamo/requestplus/analysis-person/forms'
import { CompanyRequestPersonConfig } from '~/models/dynamo/userplus/company'
import logger from '~/utils/logger'

import eagleSystemRequestConstructor from './eagle-system-request-constructor'
import m2PersonAnalysisConstructor from './m2-person-analysis-constructor'
import pfBasicBiometryConstructor, { PfBasicBiometryConstructorParams } from './pf-basic-biometry-constructor'
import pfFacialBiometryConstructor, { PfFacialBiometryConstructorParams } from './pf-facial-biometry-constructor'
import pfFacialCDVBiometryConstructor, { PfFacialCDVBiometryConstructorParams } from './pf-facial-cdv-biometry-constructor'

export type PersonSnsMountMessageParams = {
  company_request_person_config: CompanyRequestPersonConfig
  images?: DatavalidImageObject<unknown>
  person_analysis_option: CompanyRequestPersonConfigEnum,
  person_data: PersonRequestForms,
  person_id: string
  request_id: string
}

const personSnsMountMessage = ({
  company_request_person_config,
  images,
  person_analysis_option,
  person_data,
  person_id,
  request_id,
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
      return eagleSystemRequestConstructor({
        person_analysis_option,
        person_data,
        person_id,
        request_id,
      })
    case CompanyRequestPersonConfigEnum.CNH_ADVANCED:
      return eagleSystemRequestConstructor({
        person_analysis_option,
        person_data,
        person_id,
        request_id,
      })
    case CompanyRequestPersonConfigEnum.BASIC_DATA:
      return eagleSystemRequestConstructor({
        person_analysis_option,
        person_data,
        person_id,
        request_id,
      })
    case CompanyRequestPersonConfigEnum.PROCESS:
      return eagleSystemRequestConstructor({
        person_analysis_option,
        person_data,
        person_id,
        request_id,
      })
    case CompanyRequestPersonConfigEnum.ETHICAL:
      return m2PersonAnalysisConstructor({
        company_request_person_config,
        person_analysis_options_to_request: person_analysis_option,
        person_data,
        person_id,
        request_id,
      })
    case CompanyRequestPersonConfigEnum.ETHICAL_COMPLETE:
      return m2PersonAnalysisConstructor({
        company_request_person_config,
        person_analysis_options_to_request: person_analysis_option,
        person_data,
        person_id,
        request_id,
      })
    case CompanyRequestPersonConfigEnum.HISTORY:
      return m2PersonAnalysisConstructor({
        company_request_person_config,
        person_analysis_options_to_request: person_analysis_option,
        person_data,
        person_id,
        request_id,
      })
    default: {
      const exhaustiveness_check: never = person_analysis_option

      logger.warn({
        message: 'There is no option in person analysis options to mount sns message',
        person_analysis_option,
        exhaustiveness_check,
      })

      return undefined
    }
  }
}

export default personSnsMountMessage

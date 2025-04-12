import { CompanyRequestPersonConfigEnum, CompanyRequestVehicleConfigEnum } from '~/models/dynamo/enums/company'

export const thirdPartyCompanyRequestPersonConfigMap: Record<CompanyRequestPersonConfigEnum, string> = {
  [CompanyRequestPersonConfigEnum.BASIC_DATA]: 'eagle_system_person',
  [CompanyRequestPersonConfigEnum.BIOMETRY_BASIC]: 'datavalid',
  [CompanyRequestPersonConfigEnum.BIOMETRY_CNH]: 'datavalid',
  [CompanyRequestPersonConfigEnum.BIOMETRY_FACIAL]: 'datavalid',
  [CompanyRequestPersonConfigEnum.CNH_ADVANCED]: 'eagle_system_person',
  [CompanyRequestPersonConfigEnum.CNH_SIMPLE]: 'eagle_system_person',
  [CompanyRequestPersonConfigEnum.ETHICAL]: 'm2_system_person',
  [CompanyRequestPersonConfigEnum.HISTORY]: 'm2_system_person',
  [CompanyRequestPersonConfigEnum.PROCESS]: 'eagle_system_person',
}

export const thirdPartyCompanyRequestVehicleConfigMap: Record<CompanyRequestVehicleConfigEnum, string> = {
  [CompanyRequestVehicleConfigEnum.ANTT]: 'eagle_system_vehicle',
  [CompanyRequestVehicleConfigEnum.BASIC_DATA]: 'eagle_system_vehicle',
  [CompanyRequestVehicleConfigEnum.CRONOTACOGRAFO]: 'eagle_system_vehicle',
  [CompanyRequestVehicleConfigEnum.ETHICAL]: 'm2_system_vehicle',
  [CompanyRequestVehicleConfigEnum.PLATE_HISTORY]: 'm2_system_vehicle',
}

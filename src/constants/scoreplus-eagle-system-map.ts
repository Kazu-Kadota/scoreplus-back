import { CompanyRequestPersonConfigEnum, CompanyRequestVehicleConfigEnum } from '~/models/dynamo/enums/company'
import { EagleSystemPersonAnalysisTypeEnum, EagleSystemVehicleAnalysisTypeEnum } from '~/models/eagle/enums/request-enum'

export const scoreplusEagleSystemPersonConfigMap: Partial<Record<CompanyRequestPersonConfigEnum, EagleSystemPersonAnalysisTypeEnum>> = {
  [CompanyRequestPersonConfigEnum.BASIC_DATA]: EagleSystemPersonAnalysisTypeEnum.BASIC_DATA,
  [CompanyRequestPersonConfigEnum.CNH_ADVANCED]: EagleSystemPersonAnalysisTypeEnum.CNH_STATUS,
  [CompanyRequestPersonConfigEnum.CNH_SIMPLE]: EagleSystemPersonAnalysisTypeEnum.CNH_BASIC,
  [CompanyRequestPersonConfigEnum.ETHICAL]: EagleSystemPersonAnalysisTypeEnum.SIMPLE,
  [CompanyRequestPersonConfigEnum.HISTORY]: EagleSystemPersonAnalysisTypeEnum.HISTORY,
  [CompanyRequestPersonConfigEnum.PROCESS]: EagleSystemPersonAnalysisTypeEnum.PROCESS,
}

export const eagleSystemScoreplusPersonConfigMap: Partial<Record<EagleSystemPersonAnalysisTypeEnum, CompanyRequestPersonConfigEnum>> = {
  [EagleSystemPersonAnalysisTypeEnum.BASIC_DATA]: CompanyRequestPersonConfigEnum.BASIC_DATA,
  [EagleSystemPersonAnalysisTypeEnum.CNH_STATUS]: CompanyRequestPersonConfigEnum.CNH_ADVANCED,
  [EagleSystemPersonAnalysisTypeEnum.CNH_BASIC]: CompanyRequestPersonConfigEnum.CNH_SIMPLE,
  [EagleSystemPersonAnalysisTypeEnum.SIMPLE]: CompanyRequestPersonConfigEnum.ETHICAL,
  [EagleSystemPersonAnalysisTypeEnum.HISTORY]: CompanyRequestPersonConfigEnum.HISTORY,
  [EagleSystemPersonAnalysisTypeEnum.PROCESS]: CompanyRequestPersonConfigEnum.PROCESS,
}

export const scoreplusEagleSystemVehicleConfigMap: Partial<Record<CompanyRequestVehicleConfigEnum, EagleSystemVehicleAnalysisTypeEnum>> = {
  [CompanyRequestVehicleConfigEnum.ANTT]: EagleSystemVehicleAnalysisTypeEnum.ANTT,
  [CompanyRequestVehicleConfigEnum.ETHICAL]: EagleSystemVehicleAnalysisTypeEnum.SIMPLE,
  [CompanyRequestVehicleConfigEnum.PLATE_HISTORY]: EagleSystemVehicleAnalysisTypeEnum.VEHICLE_PLATE_HISTORY,
  [CompanyRequestVehicleConfigEnum.BASIC_DATA]: EagleSystemVehicleAnalysisTypeEnum.BASIC_DATA,
}

export const eagleSystemScoreplusVehicleConfigMap: Partial<Record<EagleSystemVehicleAnalysisTypeEnum, CompanyRequestVehicleConfigEnum>> = {
  [EagleSystemVehicleAnalysisTypeEnum.ANTT]: CompanyRequestVehicleConfigEnum.ANTT,
  [EagleSystemVehicleAnalysisTypeEnum.BASIC_DATA]: CompanyRequestVehicleConfigEnum.BASIC_DATA,
  [EagleSystemVehicleAnalysisTypeEnum.SIMPLE]: CompanyRequestVehicleConfigEnum.ETHICAL,
  [EagleSystemVehicleAnalysisTypeEnum.VEHICLE_PLATE_HISTORY]: CompanyRequestVehicleConfigEnum.PLATE_HISTORY,
}

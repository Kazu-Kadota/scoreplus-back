import { CompanyRequestPersonConfigEnum, CompanyRequestVehicleConfigEnum } from '~/models/dynamo/enums/company'
import { M2PersonAnalysisTypeEnum, M2VehicleAnalysisTypeEnum } from '~/models/m2system/enums/analysis'

export const scoreplusM2SystemPersonConfigMap: Partial<Record<CompanyRequestPersonConfigEnum, M2PersonAnalysisTypeEnum>> = {
  [CompanyRequestPersonConfigEnum.ETHICAL]: M2PersonAnalysisTypeEnum.SIMPLE,
  [CompanyRequestPersonConfigEnum.HISTORY]: M2PersonAnalysisTypeEnum.HISTORY,
}

export const m2SystemScoreplusPersonConfigMap: Partial<Record<M2PersonAnalysisTypeEnum, CompanyRequestPersonConfigEnum>> = {
  [M2PersonAnalysisTypeEnum.SIMPLE]: CompanyRequestPersonConfigEnum.ETHICAL,
  [M2PersonAnalysisTypeEnum.HISTORY]: CompanyRequestPersonConfigEnum.HISTORY,
}

export const scoreplusM2SystemVehicleConfigMap: Partial<Record<CompanyRequestVehicleConfigEnum, M2VehicleAnalysisTypeEnum>> = {
  [CompanyRequestVehicleConfigEnum.ETHICAL]: M2VehicleAnalysisTypeEnum.SIMPLE,
  [CompanyRequestVehicleConfigEnum.PLATE_HISTORY]: M2VehicleAnalysisTypeEnum.VEHICLE_PLATE_HISTORY,
}

export const m2SystemScoreplusVehicleConfigMap: Partial<Record<M2VehicleAnalysisTypeEnum, CompanyRequestVehicleConfigEnum>> = {
  [M2VehicleAnalysisTypeEnum.SIMPLE]: CompanyRequestVehicleConfigEnum.ETHICAL,
  [M2VehicleAnalysisTypeEnum.VEHICLE_PLATE_HISTORY]: CompanyRequestVehicleConfigEnum.PLATE_HISTORY,
}

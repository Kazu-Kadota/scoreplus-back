import { CompanyRequestPersonConfigEnum, CompanyRequestVehicleConfigEnum } from './dynamo/enums/company'

export interface SNSThirdPartyWorkersPersonMessage<T = any> extends Partial<Record<CompanyRequestPersonConfigEnum, T>> {}

export interface SNSThirdPartyWorkersVehicleMessage<T = any> extends Partial<Record<CompanyRequestVehicleConfigEnum, T>> {}

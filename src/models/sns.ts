import { CompanySystemConfigEnum } from './dynamo/company'

export interface SNSThirdPartyWorkersMessage<T = any> extends Partial<Record<CompanySystemConfigEnum, T>> {}

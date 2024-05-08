import { MessageAttributeValue } from '@aws-sdk/client-sns'

import { CompanyRequestPersonConfigEnum, CompanyRequestVehicleConfigEnum } from './dynamo/enums/company'

export type SNSMessageAttributes = {
  origin: MessageAttributeValue,
  requestId: MessageAttributeValue,
}

export type SNSThirdPartyWorkersPersonMessage<T = any> =
  Partial<Record<CompanyRequestPersonConfigEnum, T>>
  & {}

export type SNSThirdPartyWorkersVehicleMessage<T = any> =
  Partial<Record<CompanyRequestVehicleConfigEnum, T>>
  & {}

import Joi from 'joi'

import { PersonStateEnum, VehicleAnalysisStateEnum } from './dynamo/enums/request'

export const EventBridgeSQSEventBodyDetailType = {
  PERSON_PRESIGNED_URL_GENERATED: 'PersonPresignedURLGenerated',
  VEHICLE_PRESIGNED_URL_GENERATED: 'VehiclePresignedURLGenerated',
} as const

export const eventBridgeBodyDetailSchemas = {
  [EventBridgeSQSEventBodyDetailType.PERSON_PRESIGNED_URL_GENERATED]: {
    schema: Joi.object({
      person_analysis_type: Joi.string().max(255).required(),
      person_id: Joi.string().uuid().required(),
      region: Joi.string().valid(...Object.values(PersonStateEnum)).optional(),
      request_id: Joi.string().uuid().required(),
      s3_presigned_url: Joi.string().uri().required(),
    }),
    type: {} as {
      person_analysis_type: string
      person_id: string
      region?: PersonStateEnum
      request_id: string
      s3_presigned_url: string
    },
  },
  [EventBridgeSQSEventBodyDetailType.VEHICLE_PRESIGNED_URL_GENERATED]: {
    schema: Joi.object({
      vehicle_analysis_type: Joi.string().max(255).required(),
      vehicle_id: Joi.string().uuid().required(),
      region: Joi.string().valid(...Object.values(VehicleAnalysisStateEnum)).optional(),
      request_id: Joi.string().uuid().required(),
      s3_presigned_url: Joi.string().uri().required(),
    }),
    type: {} as {
      vehicle_analysis_type: string
      vehicle_id: string
      region?: VehicleAnalysisStateEnum
      request_id: string
      s3_presigned_url: string
    },
  },
} as const

export type EventBridgeSQSEventBodyDetail = {
  [K in keyof typeof eventBridgeBodyDetailSchemas]: typeof eventBridgeBodyDetailSchemas[K]['type']
}

export type EventBridgeSQSEventBody<T extends keyof EventBridgeSQSEventBodyDetail> = {
  version: string
  id: string
  'detail-type': T
  source: string
  account: string
  time: string
  region: string
  resources: string[]
  detail: EventBridgeSQSEventBodyDetail[T]
}

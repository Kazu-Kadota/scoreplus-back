import Joi from 'joi'

import { eventBridgeBodyDetailSchemas, EventBridgeSQSEventBody, EventBridgeSQSEventBodyDetailType } from '~/models/eventbridge'
import BadRequestError from '~/utils/errors/400-bad-request'
import logger from '~/utils/logger'

const schema = Joi.object<EventBridgeSQSEventBody<'VehiclePresignedURLGenerated'>>({
  version: Joi.string().required(),
  id: Joi.string().required(),
  'detail-type': Joi.string()
    .valid(EventBridgeSQSEventBodyDetailType.VEHICLE_PRESIGNED_URL_GENERATED)
    .required(),
  source: Joi.string().required(),
  account: Joi.string().required(),
  time: Joi.string().isoDate().required(),
  region: Joi.string().required(),
  resources: Joi.array().items(Joi.string()).required(),
  detail: eventBridgeBodyDetailSchemas[EventBridgeSQSEventBodyDetailType.VEHICLE_PRESIGNED_URL_GENERATED].schema
    .required(),
}).required()

const validateBody = (
  data: Partial<EventBridgeSQSEventBody<'VehiclePresignedURLGenerated'>>,
): EventBridgeSQSEventBody<'VehiclePresignedURLGenerated'> => {
  const { value, error } = schema.validate(data, {
    abortEarly: true,
  })

  if (error) {
    logger.error({
      message: 'Error on validate eagle system vehicle analysis answer consumer',
    })

    throw new BadRequestError('Erro na validação do body para consumo da resposta da análise de veículo do Eagle System', error.stack as string)
  }

  return value
}

export default validateBody

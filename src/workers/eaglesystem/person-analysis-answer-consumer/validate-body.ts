import Joi from 'joi'

import { eventBridgeBodyDetailSchemas, EventBridgeSQSEventBody, EventBridgeSQSEventBodyDetailType } from '~/models/eventbridge'
import InternalServerError from '~/utils/errors/500-internal-server-error'
import logger from '~/utils/logger'

const schema = Joi.object<EventBridgeSQSEventBody<'PersonPresignedURLGenerated'>>({
  version: Joi.string().required(),
  id: Joi.string().required(),
  'detail-type': Joi.string()
    .valid(EventBridgeSQSEventBodyDetailType.PERSON_PRESIGNED_URL_GENERATED)
    .required(),
  // 'detail-type': Joi.string()
  //   .valid(...Object.keys(eventBridgeBodyDetailSchemas))
  //   .required(),
  source: Joi.string().required(),
  account: Joi.string().required(),
  time: Joi.string().isoDate().required(),
  region: Joi.string().required(),
  resources: Joi.array().items(Joi.string()).required(),
  detail: eventBridgeBodyDetailSchemas[EventBridgeSQSEventBodyDetailType.PERSON_PRESIGNED_URL_GENERATED].schema
    .required(),
  // detail: Joi.alternatives()
  //   .conditional('detail-type', {
  //     switch: Object.entries(eventBridgeBodyDetailSchemas).map(([key, { schema }]) => ({
  //       is: key,
  //       then: schema,
  //     })),
  //     otherwise: Joi.forbidden(),
  //   })
  //   .required(),
}).required()

const validateBody = (
  data: Partial<EventBridgeSQSEventBody<'PersonPresignedURLGenerated'>>,
): EventBridgeSQSEventBody<'PersonPresignedURLGenerated'> => {
  const { value, error } = schema.validate(data, {
    abortEarly: true,
  })

  if (error) {
    logger.error({
      message: 'Error on validate eagle system person analysis answer consumer',
    })

    throw new InternalServerError('Erro na validação do body para consumo da resposta da análise de pessoa do Eagle System', error.stack as string)
  }

  return value
}

export default validateBody

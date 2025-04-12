import Joi from 'joi'

import { SendAnswerVehiclePath } from '~/models/dynamo/requestplus/finished-analysis-vehicle/table'
import BadRequestError from '~/utils/errors/400-bad-request'
import logger from '~/utils/logger'

const schema = Joi.object<SendAnswerVehiclePath, true>({
  vehicle_id: Joi
    .string()
    .uuid()
    .required(),
}).required()

const validatePath = (
  data: Partial<SendAnswerVehiclePath | undefined>,
): SendAnswerVehiclePath => {
  const { value, error } = schema.validate(data, {
    abortEarly: true,
  })

  if (error) {
    logger.error({
      message: 'Error on validate "send validation vehicle" path',
    })

    throw new BadRequestError('Erro na validação do path para envio da validação da análise de veículos', error.stack as string)
  }

  return value
}

export default validatePath

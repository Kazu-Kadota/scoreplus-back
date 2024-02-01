import Joi from 'joi'

import BadRequestError from '~/utils/errors/400-bad-request'
import logger from '~/utils/logger'

export type ValidateQueryVehicle = {
  vehicle_id: string
}

const schema = Joi.object<ValidateQueryVehicle, true>({
  vehicle_id: Joi
    .string()
    .uuid()
    .required(),
}).required()

const validateQueryVehicle = (
  data: Partial<ValidateQueryVehicle>,
): ValidateQueryVehicle => {
  const { value, error } = schema.validate(data, {
    abortEarly: true,
  })

  if (error) {
    logger.error({
      message: 'Error on validate "send answer vehicle" query',
    })

    throw new BadRequestError('Erro na validação do query para envio da resposta da análise de veículo', error.stack as string)
  }

  return value
}

export default validateQueryVehicle

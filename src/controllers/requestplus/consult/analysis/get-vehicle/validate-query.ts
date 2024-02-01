import Joi from 'joi'

import BadRequestError from '~/utils/errors/400-bad-request'
import logger from '~/utils/logger'

export type ValidateVehicleQuery = {
  request_id: string
}

const schema = Joi.object({
  request_id: Joi
    .string()
    .uuid()
    .required(),
}).required()

const validateVehicleQuery = (
  data: Partial<ValidateVehicleQuery | undefined>,
): ValidateVehicleQuery => {
  const { value, error } = schema.validate(data, {
    abortEarly: true,
  })

  if (error) {
    logger.error({
      message: 'Error on validate "get vehicle" query',
    })

    throw new BadRequestError('Erro na validação da query para obter veículo', error.stack as string)
  }

  return value
}

export default validateVehicleQuery

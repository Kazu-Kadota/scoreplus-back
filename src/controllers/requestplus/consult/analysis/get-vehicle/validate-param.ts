import Joi from 'joi'

import BadRequestError from '~/utils/errors/400-bad-request'
import logger from '~/utils/logger'

export type RequestVehicleByRequestId = {
  vehicle_id: string
}

const schema = Joi.object({
  vehicle_id: Joi
    .string()
    .uuid()
    .required(),
}).required()

const validateVehicleParam = (
  data: Partial<RequestVehicleByRequestId | undefined>,
): RequestVehicleByRequestId => {
  const { value, error } = schema.validate(data, {
    abortEarly: true,
  })

  if (error) {
    logger.error({
      message: 'Error on validate "get vehicle" path parameter',
    })

    throw new BadRequestError('Erro na validação do path parameter para obter veículo', error.stack as string)
  }

  return value
}

export default validateVehicleParam

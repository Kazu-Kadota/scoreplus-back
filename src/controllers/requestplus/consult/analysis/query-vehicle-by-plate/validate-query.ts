import Joi from 'joi'

import { PlateStateEnum } from '~/models/dynamo/enums/request'
import BadRequestError from '~/utils/errors/400-bad-request'
import logger from '~/utils/logger'

const plateRegex = /^([A-Za-z0-9]{7})$/

export type RequestVehicleByPlateQuery = {
  plate: string
  plate_state: PlateStateEnum
  company_name?: string
}

const schema = Joi.object<RequestVehicleByPlateQuery, true>({
  plate: Joi
    .string()
    .regex(plateRegex)
    .required(),
  plate_state: Joi
    .string()
    .valid(...Object.values(PlateStateEnum))
    .required(),
  company_name: Joi
    .string()
    .optional(),
}).required()

const validateQuery = (
  data: Partial<RequestVehicleByPlateQuery | undefined>,
): RequestVehicleByPlateQuery => {
  const { value, error } = schema.validate(data, {
    abortEarly: true,
  })

  if (error) {
    logger.error({
      message: 'Error on validate "query vehicle by plate" query',
    })

    throw new BadRequestError('Erro na validação do query para obter veículo pela placa', error.stack as string)
  }

  return value
}

export default validateQuery

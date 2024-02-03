import Joi from 'joi'

import { RequestplusFinishedAnalysisVehicleKey } from '~/models/dynamo/requestplus/finished-analysis-vehicle/table'
import BadRequestError from '~/utils/errors/400-bad-request'
import logger from '~/utils/logger'

const schema = Joi.object<RequestplusFinishedAnalysisVehicleKey>({
  vehicle_id: Joi
    .string()
    .uuid()
    .required(),
  request_id: Joi
    .string()
    .uuid()
    .required(),
}).required()

const validateVehicleReleaseExtract = (
  data: Partial<RequestplusFinishedAnalysisVehicleKey>,
): RequestplusFinishedAnalysisVehicleKey => {
  const { value, error } = schema.validate(data, {
    abortEarly: true,
  })

  if (error) {
    logger.error({
      message: 'Error on validate vehicle release extract body',
    })

    throw new BadRequestError('Erro na validação do body para solicitação do extrato de liberação de veículo', error.stack as string)
  }

  return value
}

export default validateVehicleReleaseExtract

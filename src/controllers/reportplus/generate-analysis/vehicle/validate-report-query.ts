import Joi from 'joi'

import BadRequestError from '~/utils/errors/400-bad-request'
import logger from '~/utils/logger'

export type ValidateReportQuery = {
  start_date: string
  final_date: string
  company?: string
}

const schema = Joi.object({
  start_date: Joi
    .string()
    .isoDate()
    .required(),
  final_date: Joi
    .string()
    .isoDate()
    .required(),
  company: Joi
    .string()
    .max(255)
    .optional(),
}).required()

const validateReportQuery = (
  data: Partial<ValidateReportQuery>,
): ValidateReportQuery => {
  const { value, error } = schema.validate(data, {
    abortEarly: true,
  })

  if (error) {
    logger.error({
      message: 'Error on validate report request query',
    })

    throw new BadRequestError('Erro na validação do query para solicitação do relatório', error.stack as string)
  }

  return value
}

export default validateReportQuery

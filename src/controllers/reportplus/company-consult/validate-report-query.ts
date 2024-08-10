import Joi from 'joi'

import BadRequestError from '~/utils/errors/400-bad-request'
import logger from '~/utils/logger'

export type ValidateCompanyConsultQuery = {
  year: string
  month: string
  company?: string
  summary: boolean
}

const schema = Joi.object<ValidateCompanyConsultQuery, true>({
  year: Joi
    .string()
    .min(4)
    .max(4)
    .required(),
  month: Joi
    .string()
    .min(2)
    .max(2)
    .required(),
  company: Joi
    .string()
    .max(255)
    .optional(),
  summary: Joi
    .boolean()
    .default(true)
    .required(),
}).required()

const validateCompanyConsultQuery = (
  data: Partial<ValidateCompanyConsultQuery>,
): ValidateCompanyConsultQuery => {
  const { value, error } = schema.validate(data, {
    abortEarly: true,
  })

  if (error) {
    logger.error({
      message: 'Error on validate company consult report',
    })

    throw new BadRequestError('Erro na validação do query para solicitação do relatório de consultas', error.stack as string)
  }

  return value
}

export default validateCompanyConsultQuery

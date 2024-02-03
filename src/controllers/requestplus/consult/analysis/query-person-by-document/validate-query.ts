import Joi from 'joi'

import BadRequestError from '~/utils/errors/400-bad-request'
import logger from '~/utils/logger'

const documentRegex = /^([0-9]{3}\.?[0-9]{3}\.?[0-9]{3}\-?[0-9]{2}|[0-9]{2}\.?[0-9]{3}\.?[0-9]{3}\/?[0-9]{4}\-?[0-9]{2})$/

export type RequestPersonByDocumentQuery = {
  document: string
  company_name?: string
}

const schema = Joi.object<RequestPersonByDocumentQuery, true>({
  document: Joi
    .string()
    .regex(documentRegex)
    .required(),
  company_name: Joi
    .string()
    .min(3)
    .max(255)
    .optional(),
}).required()

const validateQuery = (
  data: Partial<RequestPersonByDocumentQuery | undefined>,
): RequestPersonByDocumentQuery => {
  const { value, error } = schema.validate(data, {
    abortEarly: true,
  })

  if (error) {
    logger.error({
      message: 'Error on validate "query person by document" query',
    })

    throw new BadRequestError('Erro na validação do query para obter pessoa pelo documento', error.stack as string)
  }

  return value
}

export default validateQuery

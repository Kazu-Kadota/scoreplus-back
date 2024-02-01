import Joi from 'joi'

import BadRequestError from '~/utils/errors/400-bad-request'
import logger from '~/utils/logger'

export type RequestPersonById = {
  person_id: string
}

const schema = Joi.object({
  person_id: Joi
    .string()
    .uuid()
    .required(),
}).required()

const validatePersonParam = (
  data: Partial<RequestPersonById | undefined>,
): RequestPersonById => {
  const { value, error } = schema.validate(data, {
    abortEarly: true,
  })

  if (error) {
    logger.error({
      message: 'Error on validate "query person by id" path parameter',
    })

    throw new BadRequestError('Erro na validação do path parameter para obter pessoa pelo id', error.stack as string)
  }

  return value
}

export default validatePersonParam

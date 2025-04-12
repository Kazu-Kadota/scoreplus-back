import Joi from 'joi'

import BadRequestError from '~/utils/errors/400-bad-request'
import logger from '~/utils/logger'

export type ValidateQueryPerson = {
  request_id: string
}

const schema = Joi.object<ValidateQueryPerson, true>({
  request_id: Joi
    .string()
    .uuid()
    .required(),
}).required()

const validateQueryPerson = (
  data: Partial<ValidateQueryPerson>,
): ValidateQueryPerson => {
  const { value, error } = schema.validate(data, {
    abortEarly: true,
  })

  if (error) {
    logger.error({
      message: 'Error on validate "send validate person" query',
    })

    throw new BadRequestError('Erro na validação do query para envio da validação da análise de pessoas', error.stack as string)
  }

  return value
}

export default validateQueryPerson

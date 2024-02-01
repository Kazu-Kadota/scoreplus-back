import Joi from 'joi'

import { SendAnswerPersonPath } from '~/models/dynamo/requestplus/finished-analysis-person/table'
import BadRequestError from '~/utils/errors/400-bad-request'
import logger from '~/utils/logger'

const schema = Joi.object<SendAnswerPersonPath, true>({
  id: Joi
    .string()
    .uuid()
    .required(),
}).required()

const validatePath = (
  data: Partial<SendAnswerPersonPath | undefined>,
): SendAnswerPersonPath => {
  const { value, error } = schema.validate(data, {
    abortEarly: true,
  })

  if (error) {
    logger.error({
      message: 'Error on validate "send answer person" path',
    })

    throw new BadRequestError('Erro na validação do path para envio da resposta da análise de veículos', error.stack as string)
  }

  return value
}

export default validatePath

import Joi from 'joi'

import { ComboReleaseExtractKey } from '~/models/dynamo/requestplus/combo'
import BadRequestError from '~/utils/errors/400-bad-request'
import logger from '~/utils/logger'

const schema = Joi.object<ComboReleaseExtractKey, true>({
  combo_id: Joi
    .string()
    .uuid()
    .required(),
}).required()

const validateComboReleaseExtract = (
  data: Partial<ComboReleaseExtractKey>,
): ComboReleaseExtractKey => {
  const { value, error } = schema.validate(data, {
    abortEarly: true,
  })

  if (error) {
    logger.error({
      message: 'Error on validate combo release extract body',
    })

    throw new BadRequestError('Erro na validação do body para solicitação do extrato de liberação de combo', error.stack as string)
  }

  return value
}

export default validateComboReleaseExtract

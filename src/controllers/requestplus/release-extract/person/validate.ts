import Joi from 'joi'

import { RequestplusFinishedAnalysisPersonKey } from '~/models/dynamo/requestplus/finished-analysis-person/table'
import BadRequestError from '~/utils/errors/400-bad-request'
import logger from '~/utils/logger'

const schema = Joi.object<RequestplusFinishedAnalysisPersonKey, true>({
  person_id: Joi
    .string()
    .uuid()
    .required(),
  request_id: Joi
    .string()
    .uuid()
    .required(),
}).required()

const validatePersonReleaseExtract = (
  data: Partial<RequestplusFinishedAnalysisPersonKey>,
): RequestplusFinishedAnalysisPersonKey => {
  const { value, error } = schema.validate(data, {
    abortEarly: true,
  })

  if (error) {
    logger.error({
      message: 'Error on validate person release extract body',
    })

    throw new BadRequestError('Erro na validação do body para solicitação do extrato de liberação de pessoa', error.stack as string)
  }

  return value
}

export default validatePersonReleaseExtract

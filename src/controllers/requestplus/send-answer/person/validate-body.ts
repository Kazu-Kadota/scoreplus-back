import Joi from 'joi'

import { CompanyRequestPersonConfigEnum } from '~/models/dynamo/enums/company'
import { PersonStateEnum } from '~/models/dynamo/enums/request'
import { UseCaseSendPersonAnswersBody } from '~/use-cases/answer-person-analysis'
import BadRequestError from '~/utils/errors/400-bad-request'
import logger from '~/utils/logger'

const schema = Joi.array<UseCaseSendPersonAnswersBody[]>().items(
  Joi.object<UseCaseSendPersonAnswersBody, true>({
    reason: Joi
      .string()
      .optional(),
    type: Joi
      .string()
      .valid(...Object.values(CompanyRequestPersonConfigEnum))
      .required(),
    region: Joi
      .string()
      .when('type', {
        is: CompanyRequestPersonConfigEnum.HISTORY,
        then: Joi.valid(...Object.values(PersonStateEnum)).required(),
        otherwise: Joi.forbidden(),
      }),
  }).required())

const validateBody = (
  data: Partial<UseCaseSendPersonAnswersBody[]>,
): UseCaseSendPersonAnswersBody[] => {
  const { value, error } = schema.validate(data, {
    abortEarly: true,
  })

  if (error) {
    logger.error({
      message: 'Error on validate "send answer person" body',
    })

    throw new BadRequestError('Erro na validação do body para envio da resposta da análise de pessoas', error.stack as string)
  }

  return value
}

export default validateBody

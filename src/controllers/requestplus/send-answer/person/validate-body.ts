import Joi from 'joi'

import { CompanyRequestPersonConfigEnum } from '~/models/dynamo/enums/company'
import { AnalysisResultEnum, PersonStateEnum } from '~/models/dynamo/enums/request'
import { SendAnswerPersonBody } from '~/models/dynamo/requestplus/finished-analysis-person/table'
import BadRequestError from '~/utils/errors/400-bad-request'
import logger from '~/utils/logger'

export type ValidateSendAnswerPersonBody = Omit<SendAnswerPersonBody, 'answered_at'>

const schema = Joi.array<ValidateSendAnswerPersonBody[]>().items(
  Joi.object<ValidateSendAnswerPersonBody, true>({
    reason: Joi
      .string()
      .when('result', {
        is: AnalysisResultEnum.REJECTED,
        then: Joi.required(),
        otherwise: Joi.optional(),
      }),
    result: Joi
      .string()
      .valid(...Object.values(AnalysisResultEnum))
      .required(),
    type: Joi
      .string()
      .valid(CompanyRequestPersonConfigEnum.ETHICAL, CompanyRequestPersonConfigEnum.HISTORY)
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
  data: Partial<ValidateSendAnswerPersonBody[]>,
): ValidateSendAnswerPersonBody[] => {
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

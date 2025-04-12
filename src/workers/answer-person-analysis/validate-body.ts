import Joi from 'joi'

import { CompanyRequestPersonConfigEnum } from '~/models/dynamo/enums/company'
import { PersonStateEnum } from '~/models/dynamo/enums/request'
import { UseCaseSendPersonAnswersBody } from '~/use-cases/answer-person-analysis'
import InternalServerError from '~/utils/errors/500-internal-server-error'
import logger from '~/utils/logger'

import { AnswerPersonAnalysisWorkerMessageBody } from './main'

const schema = Joi.object<AnswerPersonAnalysisWorkerMessageBody, true>({
  answers_body: Joi.array<UseCaseSendPersonAnswersBody[]>().items(
    Joi.object<UseCaseSendPersonAnswersBody, true>({
      reason: Joi
        .string()
        .required(),
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
    }).required()),
  person_id: Joi
    .string()
    .uuid()
    .required(),
  request_id: Joi
    .string()
    .uuid()
    .required(),
}).required()

const validateBody = (
  data: Partial<AnswerPersonAnalysisWorkerMessageBody>,
): AnswerPersonAnalysisWorkerMessageBody => {
  const { value, error } = schema.validate(data, {
    abortEarly: true,
  })

  if (error) {
    logger.error({
      message: 'Error on validate answer person analysis',
    })

    throw new InternalServerError('Erro na validação do body para responder análise de pessoa', error.stack as string)
  }

  return value
}

export default validateBody

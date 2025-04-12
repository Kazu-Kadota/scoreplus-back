import Joi from 'joi'

import { CompanyRequestPersonConfigEnum } from '~/models/dynamo/enums/company'
import { AnalysisResultEnum, PersonStateEnum } from '~/models/dynamo/enums/request'
import { UseCaseValidatePersonAnalysisBody } from '~/use-cases/validate-person-analysis'
import InternalServerError from '~/utils/errors/500-internal-server-error'
import logger from '~/utils/logger'

import { ValidatePersonAnalysisWorkerMessageBody } from './main'

const schema = Joi.object<ValidatePersonAnalysisWorkerMessageBody, true>({
  validations_body: Joi.array<UseCaseValidatePersonAnalysisBody[]>().items(
    Joi.object<UseCaseValidatePersonAnalysisBody, true>({
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
  validation_user_id: Joi
    .string()
    .uuid()
    .required(),
}).required()

const validateBody = (
  data: Partial<ValidatePersonAnalysisWorkerMessageBody>,
): ValidatePersonAnalysisWorkerMessageBody => {
  const { value, error } = schema.validate(data, {
    abortEarly: true,
  })

  if (error) {
    logger.error({
      message: 'Error on validate validate person analysis',
    })

    throw new InternalServerError('Erro na validação do body para validar análise de pessoa', error.stack as string)
  }

  return value
}

export default validateBody

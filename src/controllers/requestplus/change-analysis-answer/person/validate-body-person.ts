import Joi from 'joi'

import { CompanyRequestPersonConfigEnum } from '~/models/dynamo/enums/company'
import { PersonStateEnum } from '~/models/dynamo/enums/request'
import { PersonAnalysisOptionsRequestValueAnswer } from '~/models/dynamo/requestplus/analysis-person/person-analysis-options'
import { RequestplusFinishedAnalysisPersonKey } from '~/models/dynamo/requestplus/finished-analysis-person/table'
import BadRequestError from '~/utils/errors/400-bad-request'
import logger from '~/utils/logger'

export type ValidateBodyPerson = Omit<PersonAnalysisOptionsRequestValueAnswer, 'answered_at'> & RequestplusFinishedAnalysisPersonKey & {
  region?: PersonStateEnum
}

const schema = Joi.object<ValidateBodyPerson, false>({
  person_id: Joi
    .string()
    .uuid()
    .required(),
  request_id: Joi
    .string()
    .uuid()
    .required(),
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
}).required()

const validateBodyPerson = (
  data: Partial<ValidateBodyPerson>,
): ValidateBodyPerson => {
  const { value, error } = schema.validate(data, {
    abortEarly: true,
  })

  if (error) {
    logger.error({
      message: 'Error on validate "change analysis answer person" body',
    })

    throw new BadRequestError('Erro na validação do body para solicitação de alteração de resposta da análise de pessoa', error.stack as string)
  }

  return value
}

export default validateBodyPerson

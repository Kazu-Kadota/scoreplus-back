import Joi from 'joi'

import { CompanyPersonAnalysisConfigEnum, CompanyRequestPersonConfigEnum } from '~/models/dynamo/enums/company'
import {
  DriverCategoryEnum,
  StateEnum,
} from '~/models/dynamo/enums/request'
import { PersonRequestForms } from '~/models/dynamo/requestplus/analysis-person/forms'
import { PersonAnalysisOptionsToRequest } from '~/models/dynamo/requestplus/analysis-person/person-analysis-options'
import { PersonAnalysisType } from '~/models/dynamo/requestplus/analysis-person/person-analysis-type'
import { RequestPersonAnalysis } from '~/models/dynamo/requestplus/analysis-person/table'
import BadRequestError from '~/utils/errors/400-bad-request'
import logger from '~/utils/logger'

export type ValidateBodyPerson = Omit<RequestPersonAnalysis, 'person_analysis_options'> & {
  person_analysis_options_to_request: PersonAnalysisOptionsToRequest
}

const documentRegex = /^([0-9]{3}\.?[0-9]{3}\.?[0-9]{3}\-?[0-9]{2}|[0-9]{2}\.?[0-9]{3}\.?[0-9]{3}\/?[0-9]{4}\-?[0-9]{2})$/
const cnhRegex = /(?=.*\d)[A-Za-z0-9]{1,11}/

export const person_schema = Joi.object<PersonRequestForms, true>({
  birth_date: Joi
    .string()
    .isoDate()
    .required(),
  category_cnh: Joi
    .string()
    .valid(...Object.values(DriverCategoryEnum))
    .optional(),
  cnh: Joi
    .string()
    .regex(cnhRegex)
    .optional(),
  company_name: Joi
    .string()
    .max(255)
    .optional(),
  document: Joi
    .string()
    .regex(documentRegex)
    .required(),
  expire_at_cnh: Joi
    .string()
    .isoDate()
    .optional(),
  father_name: Joi
    .string()
    .max(255)
    .optional(),
  mother_name: Joi
    .string()
    .max(255)
    .required(),
  name: Joi
    .string()
    .max(255)
    .required(),
  naturalness: Joi
    .string()
    .optional(),
  rg: Joi
    .string()
    .required(),
  security_number_cnh: Joi
    .string()
    .optional(),
  state_rg: Joi
    .string()
    .valid(...Object.values(StateEnum))
    .required(),
})

export const person_analysis_options_to_request_schema = Joi
  .array()
  .items(
    Joi.string().valid(...Object.values(CompanyRequestPersonConfigEnum)),
  )

export const person_analysis_type_schema = Joi.object<PersonAnalysisType, true>({
  type: Joi
    .string()
    .valid(...Object.values(CompanyPersonAnalysisConfigEnum))
    .required(),
})

const schema = Joi.object<ValidateBodyPerson, true>({
  person: person_schema.required(),
  person_analysis_options_to_request: person_analysis_options_to_request_schema.required(),
  person_analysis_type: person_analysis_type_schema.required(),
}).required()

const validateBodyPerson = (
  data: Partial<ValidateBodyPerson>,
): ValidateBodyPerson => {
  const { value, error } = schema.validate(data, {
    abortEarly: true,
  })

  if (error) {
    logger.error({
      message: 'Error on validate request person body',
    })

    throw new BadRequestError('Erro na validação do body para solicitação de análise de pessoa', error.stack as string)
  }

  return value
}

export default validateBodyPerson

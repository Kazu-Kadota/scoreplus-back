import Joi from 'joi'

import { CompanyPersonAnalysisConfigEnum } from '~/models/dynamo/enums/company'
import {
  DriverCategoryEnum,
  StateEnum,
} from '~/models/dynamo/enums/request'
import { PersonRequestForms } from '~/models/dynamo/requestplus/analysis-person/forms'
import { PersonAnalysisType } from '~/models/dynamo/requestplus/analysis-person/person-analysis-type'
import { RequestplusAnalysisPersonKey } from '~/models/dynamo/requestplus/analysis-person/table'
import BadRequestError from '~/utils/errors/400-bad-request'
import logger from '~/utils/logger'

import { BiometryBasicParseBodyReturn } from './parse-body'

const documentRegex = /^([0-9]{3}\.?[0-9]{3}\.?[0-9]{3}\-?[0-9]{2}|[0-9]{2}\.?[0-9]{3}\.?[0-9]{3}\/?[0-9]{4}\-?[0-9]{2})$/
const cnhRegex = /(?=.*\d)[A-Za-z0-9]{1,11}/

export const person_request_forms_schema = Joi.object<PersonRequestForms, true>({
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

const person_existing_person = Joi.object<RequestplusAnalysisPersonKey>({
  person_id: Joi
    .string()
    .uuid()
    .required(),
  request_id: Joi
    .string()
    .uuid()
    .required(),
})

const person_schema = Joi.object().when('is_existing_person', {
  is: true,
  then: person_existing_person,
  otherwise: person_request_forms_schema,
})

const person_analysis_type_schema = Joi.object<PersonAnalysisType, true>({
  type: Joi
    .string()
    .valid(...Object.values(CompanyPersonAnalysisConfigEnum))
    .required(),
})

const schema = Joi.object<BiometryBasicParseBodyReturn, true>({
  company_name: Joi.string().max(255).optional(),
  is_existing_person: Joi.boolean().required(),
  person: person_schema.required(),
  person_analysis_type: person_analysis_type_schema.optional(),
}).required()

const validateBody = (
  data: Partial<BiometryBasicParseBodyReturn>,
): BiometryBasicParseBodyReturn => {
  const { value, error } = schema.validate(data, {
    abortEarly: true,
  })

  if (error) {
    logger.error({
      message: 'Error on validate request person biometry basic body',
    })

    throw new BadRequestError('Erro na validação do body para solicitação de análise de biometria básica de pessoa', error.stack as string)
  }

  return value
}

export default validateBody

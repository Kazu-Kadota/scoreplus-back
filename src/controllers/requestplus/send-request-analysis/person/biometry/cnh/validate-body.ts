import Joi from 'joi'

import { PFFacialCDVImagesAnswerEnum } from '~/models/datavalid/pf-facial-cdv/request-body'
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

import { BiometryCnhParseBodyImage, BiometryCnhParseBodyReturn } from './parse-body'

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

const person_analysis_type_request_schema = Joi.object().when('is_existing_person', {
  is: false,
  then: person_analysis_type_schema,
})

const image_schema = Joi.object<BiometryCnhParseBodyImage, true>({
  image: Joi
    .binary(),
  image_type: Joi
    .string()
    .max(255),
  image_name: Joi
    .string()
    .max(255),
})

const images_schema = Joi.array<Array<string>>().items(
  Joi.string().valid(...Object.values(PFFacialCDVImagesAnswerEnum)).required(),
)

const schema = Joi.object<BiometryCnhParseBodyReturn, true>({
  company_name: Joi.string().max(255).optional(),
  is_existing_person: Joi.boolean().required(),
  document: image_schema.required(),
  document_back: image_schema.optional(),
  facial: image_schema.optional(),
  person: person_schema.required(),
  person_analysis_type: person_analysis_type_request_schema,
  images: images_schema.required(),
}).required()

const validateBody = (
  data: Partial<BiometryCnhParseBodyReturn>,
): BiometryCnhParseBodyReturn => {
  const { value, error } = schema.validate(data, {
    abortEarly: true,
  })

  if (error) {
    logger.error({
      message: 'Error on validate request person biometry cnh body',
    })

    throw new BadRequestError('Erro na validação do body para solicitação de análise de biometria cnh de pessoa', error.stack as string)
  }

  return value
}

export default validateBody

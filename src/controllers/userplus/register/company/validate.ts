import Joi from 'joi'

import {
  CompanyAnalysisConfigNumberEnum,
} from '~/models/dynamo/enums/company'
import { PersonStateEnum } from '~/models/dynamo/enums/request'
import {
  UserplusCompanyBody,
  CompanyPersonAnalysisConfig,
  CompanyRequestVehicleConfig,
  CompanyRequestPersonConfig,
} from '~/models/dynamo/userplus/company'
import BadRequestError from '~/utils/errors/400-bad-request'
import logger from '~/utils/logger'

const cnpjRegex = /^([0-9]{2}\.?[0-9]{3}\.?[0-9]{3}\/?[0-9]{4}\-?[0-9]{2})$/

const analysis_config_schema = Joi.object<CompanyPersonAnalysisConfig, true>({
  hr: Joi
    .number()
    .default(CompanyAnalysisConfigNumberEnum.HR)
    .min(0)
    .integer()
    .optional(),
  aggregate: Joi
    .number()
    .default(CompanyAnalysisConfigNumberEnum.AGGREGATE)
    .min(0)
    .integer()
    .optional(),
  autonomous: Joi
    .number()
    .default(CompanyAnalysisConfigNumberEnum.AUTONOMOUS)
    .min(0)
    .integer()
    .optional(),
  member: Joi
    .number()
    .default(CompanyAnalysisConfigNumberEnum.MEMBER)
    .min(0)
    .integer()
    .optional(),
})

const company_config_vehicle_schema = Joi.object<CompanyRequestVehicleConfig, true>({
  antt: Joi
    .boolean()
    .required(),
  'basic-data': Joi
    .boolean()
    .required(),
  ethical: Joi
    .boolean()
    .required(),
  cronotacografo: Joi
    .boolean()
    .required(),
  'plate-history': Joi
    .object()
    .required(),
})

const company_config_person_schema = Joi.object<CompanyRequestPersonConfig, true>({
  'basic-data': Joi
    .boolean()
    .required(),
  'biometry-basic': Joi
    .boolean()
    .required(),
  'biometry-cnh': Joi
    .boolean()
    .required(),
  'biometry-facial': Joi
    .boolean()
    .required(),
  'cnh-simple': Joi
    .boolean()
    .required(),
  'cnh-advanced': Joi
    .boolean()
    .required(),
  ethical: Joi
    .boolean()
    .required(),
  'ethical-complete': Joi
    .boolean()
    .required(),
  history: Joi
    .object<Record<PersonStateEnum, boolean>>()
    .default({
      SP: true,
      MG: true,
      GO: true,
      SC: true,
      PR: true,
      RJ: true,
      MT: true,
      MS: true,
    })
    .required(),
  process: Joi
    .boolean()
    .required(),
})

const schema = Joi.object<UserplusCompanyBody, true>({
  cnpj: Joi
    .string()
    .regex(cnpjRegex)
    .required(),
  name: Joi
    .string()
    .max(255)
    .required(),
  analysis_config: analysis_config_schema.required(),
  request_vehicle_config: company_config_vehicle_schema.required(),
  request_person_config: company_config_person_schema.required(),
}).required()

const validateRegisterCompany = (
  data: Partial<UserplusCompanyBody>,
): UserplusCompanyBody => {
  const { value, error } = schema.validate(data, {
    abortEarly: true,
  })

  if (error) {
    const message = 'Error on validate register company request'
    logger.error({
      message,
    })

    throw new BadRequestError(message, error.stack as string)
  }

  return value
}

export default validateRegisterCompany

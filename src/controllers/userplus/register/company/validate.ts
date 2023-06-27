import Joi from 'joi'
import {
  CompanyBody,
  CompanyPersonAnalysisConfig,
  CompanyPersonAnalysisConfigNumberEnum,
  CompanySystemConfig,
} from 'src/models/dynamo/company'
import ErrorHandler from 'src/utils/error-handler'
import logger from 'src/utils/logger'

const cnpjRegex = /^([0-9]{2}\.?[0-9]{3}\.?[0-9]{3}\/?[0-9]{4}\-?[0-9]{2})$/

const analysis_config_schema = Joi.object<CompanyPersonAnalysisConfig>({
  hr: Joi
    .number()
    .default(CompanyPersonAnalysisConfigNumberEnum.HR)
    .min(0)
    .integer()
    .optional(),
  aggregate: Joi
    .number()
    .default(CompanyPersonAnalysisConfigNumberEnum.AGGREGATE)
    .min(0)
    .integer()
    .optional(),
  autonomous: Joi
    .number()
    .default(CompanyPersonAnalysisConfigNumberEnum.AUTONOMOUS)
    .min(0)
    .integer()
    .optional(),
  member: Joi
    .number()
    .default(CompanyPersonAnalysisConfigNumberEnum.MEMBER)
    .min(0)
    .integer()
    .optional(),
})

const system_config_schema = Joi.object<CompanySystemConfig>({
  antt: Joi
    .bool()
    .default(false)
    .optional(),
  biometry: Joi
    .bool()
    .required(),
  serasa: Joi
    .bool()
    .default(false)
    .optional(),
})

const schema = Joi.object<CompanyBody>({
  cnpj: Joi
    .string()
    .regex(cnpjRegex)
    .required(),
  name: Joi
    .string()
    .max(255)
    .required(),
  analysis_config: analysis_config_schema.required(),
  system_config: system_config_schema.required(),
}).required()

const validateRegisterCompany = (
  data: Partial<CompanyBody>,
): CompanyBody => {
  const { value, error } = schema.validate(data, {
    abortEarly: true,
  })

  if (error) {
    logger.error('Error on validate register request')

    throw new ErrorHandler(error.stack as string, 400)
  }

  return value
}

export default validateRegisterCompany

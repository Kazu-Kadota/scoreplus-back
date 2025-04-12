import Joi from 'joi'

import { M2DriverCategoryEnum, M2PersonAnalysisTypeEnum, M2PersonRegionTypeEnum, M2RequestAnalysisStateEnum, M2RgStateEnum } from '~/models/m2system/enums/analysis'
import { M2PersonAnalysisItems, M2PersonRequestAnalysisBody, M2PersonRequestForms } from '~/models/m2system/request/analysis-person'
import BadRequestError from '~/utils/errors/400-bad-request'
import logger from '~/utils/logger'

const documentRegex = /^([0-9]{3}\.[0-9]{3}\.[0-9]{3}\-[0-9]{2}|[0-9]{2}\.[0-9]{3}\.[0-9]{3}\/[0-9]{4}\-[0-9]{2})$/
const cnhRegex = /(?=.*\d)[A-Za-z0-9]{1,11}/

const schema = Joi.object<M2PersonRequestAnalysisBody, true>({
  person_analysis: Joi.array<M2PersonAnalysisItems[]>().items(
    Joi.object<M2PersonAnalysisItems, true>({
      type: Joi
        .string()
        .valid(...Object.values(M2PersonAnalysisTypeEnum))
        .required(),
      region_types: Joi
        .array()
        .items(
          Joi.string().valid(...Object.values(M2PersonRegionTypeEnum)),
        )
        .max(2)
        .when('type', {
          is: M2PersonAnalysisTypeEnum.CNH_STATUS,
          then: Joi.forbidden(),
          otherwise: Joi.required(),
        }),
      regions: Joi
        .array()
        .items(
          Joi.string().valid(...Object.values(M2RequestAnalysisStateEnum)),
        )
        .min(1)
        .when('type', {
          is: M2PersonAnalysisTypeEnum.CNH_STATUS,
          then: Joi.forbidden(),
          otherwise: Joi.when('region_types', {
            is: Joi.array().items().has(M2PersonRegionTypeEnum.STATES),
            then: Joi.required(),
            otherwise: Joi.forbidden(),
          }),
        }),
    }).required(),
  ).required(),
  person: Joi.object<M2PersonRequestForms, true>({
    birth_date: Joi
      .string()
      .isoDate()
      .required(),
    category_cnh: Joi
      .string()
      .valid(...Object.values(M2DriverCategoryEnum))
      .optional(),
    cnh: Joi
      .string()
      .regex(cnhRegex)
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
    metadata: Joi
      .object()
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
      .valid(...Object.values(M2RgStateEnum))
      .required(),
    postback: Joi
      .string()
      .equal('scoreplus')
      .optional(),
  }).required(),
}).required()

const validateBody = (
  data: Partial<M2PersonRequestAnalysisBody>,
): M2PersonRequestAnalysisBody => {
  const { value, error } = schema.validate(data, {
    abortEarly: true,
  })

  if (error) {
    logger.error({
      message: 'Error on validate m2 system request person analysis',
    })

    throw new BadRequestError('Erro na validação do body para envio da análise de pessoa para M2 System', error.stack as string)
  }

  return value
}

export default validateBody

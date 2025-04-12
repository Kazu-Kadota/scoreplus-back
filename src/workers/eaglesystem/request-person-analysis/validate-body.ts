import Joi from 'joi'

import { StateEnum } from '~/models/dynamo/enums/request'
import { EagleSystemDriverCategoryEnum, EagleSystemPersonAnalysisTypeEnum, EagleSystemPersonRegionTypeEnum, EagleSystemStateEnum, is_person_analysis_type_automatic_arr } from '~/models/eagle/enums/request-enum'
import { EagleSystemRequestAnalysisPersonForms, EagleSystemRequestAnalysisPersonItems, EagleSystemRequestAnalysisPersonParams } from '~/models/eagle/request/analysis-person'
import BadRequestError from '~/utils/errors/400-bad-request'
import logger from '~/utils/logger'

const documentRegex = /^([0-9]{3}\.[0-9]{3}\.[0-9]{3}\-[0-9]{2}|[0-9]{2}\.[0-9]{3}\.[0-9]{3}\/[0-9]{4}\-[0-9]{2})$/
const cnhRegex = /(?=.*\d)[A-Za-z0-9]{1,11}/

const is_person_analysis_type_automatic_arr_joi = Joi.valid(...is_person_analysis_type_automatic_arr)

const schema = Joi.object<EagleSystemRequestAnalysisPersonParams, true>({
  person_analysis: Joi.array<EagleSystemRequestAnalysisPersonItems[]>().items(
    Joi.object<EagleSystemRequestAnalysisPersonItems, true>({
      type: Joi
        .string()
        .valid(...Object.values(EagleSystemPersonAnalysisTypeEnum))
        .required(),
      region_types: Joi
        .array()
        .items(
          Joi.string().valid(...Object.values(EagleSystemPersonRegionTypeEnum)),
        )
        .max(2)
        .min(1)
        .when('type', {
          is: is_person_analysis_type_automatic_arr_joi,
          then: Joi.forbidden(),
          otherwise: Joi.required(),
        }),
      regions: Joi
        .array()
        .items(
          Joi.string().valid(...Object.values(StateEnum)),
        )
        .min(1)
        .when('type', {
          is: is_person_analysis_type_automatic_arr_joi,
          then: Joi.forbidden(),
          otherwise: Joi.when('region_types', {
            is: Joi.array().items().has(EagleSystemPersonRegionTypeEnum.NATIONAL_STATE),
            then: Joi.array().max(1).required(),
            otherwise: Joi.when('region_types', {
              is: Joi.array().items().has(EagleSystemPersonRegionTypeEnum.STATES),
              then: Joi.array().max(27).required(),
              otherwise: Joi.forbidden(),
            }),
          }),
        }),
    }).required(),
  ).required(),
  person: Joi.object<EagleSystemRequestAnalysisPersonForms, true>({
    birth_date: Joi
      .string()
      .isoDate()
      .required(),
    category_cnh: Joi
      .string()
      .valid(...Object.values(EagleSystemDriverCategoryEnum))
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
      .valid(...Object.values(EagleSystemStateEnum))
      .required(),
    postback: Joi
      .string()
      .equal('scoreplus')
      .optional(),
  }).required(),
}).required()

const validateBody = (
  data: Partial<EagleSystemRequestAnalysisPersonParams>,
): EagleSystemRequestAnalysisPersonParams => {
  const { value, error } = schema.validate(data, {
    abortEarly: true,
  })

  if (error) {
    logger.error({
      message: 'Error on validate eagle system request person analysis',
    })

    throw new BadRequestError('Erro na validação do body para envio da análise de pessoa para Eagle System', error.stack as string)
  }

  return value
}

export default validateBody

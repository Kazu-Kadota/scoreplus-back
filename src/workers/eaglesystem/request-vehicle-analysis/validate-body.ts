import Joi from 'joi'

import { CompanyRequestVehicleConfigEnum } from '~/models/dynamo/enums/company'
import { EagleSystemPlateStateEnum } from '~/models/eagle/enums/request-enum'
import { EagleSystemVehicleRequestAnalysisTypeForms } from '~/models/eagle/request/vehicle-analysis'
import { EagleSystemRequestConstructorResponse } from '~/use-cases/publish-sns-topic-vehicle/eagle-system-request-constructor'
import InternalServerError from '~/utils/errors/500-internal-server-error'
import logger from '~/utils/logger'

const plateRegex = /^([A-Za-z0-9]{7})$/
const documentRegex = /^([0-9]{3}\.[0-9]{3}\.[0-9]{3}\-[0-9]{2}|[0-9]{2}\.[0-9]{3}\.[0-9]{3}\/[0-9]{4}\-[0-9]{2})$/

const schema = Joi.object<EagleSystemRequestConstructorResponse>({
  data: Joi.object<EagleSystemVehicleRequestAnalysisTypeForms, true>({
    company_name: Joi
      .string()
      .max(255)
      .optional(),
    metadata: Joi
      .object()
      .optional(),
    owner_document: Joi
      .string()
      .regex(documentRegex)
      .required(),
    owner_name: Joi
      .string()
      .max(255)
      .required(),
    plate_state: Joi
      .string()
      .valid(...Object.values(EagleSystemPlateStateEnum))
      .required(),
    plate: Joi
      .string()
      .regex(plateRegex)
      .required(),
    postback: Joi
      .string()
      .equal('scoreplus')
      .optional(),
  }).required(),
  vehicle_analysis_option: Joi
    .string()
    .valid(CompanyRequestVehicleConfigEnum.ANTT, CompanyRequestVehicleConfigEnum.BASIC_DATA, CompanyRequestVehicleConfigEnum.CRONOTACOGRAFO)
    .required(),
}).required()

const validateBody = (
  data: Partial<EagleSystemRequestConstructorResponse>,
): EagleSystemRequestConstructorResponse => {
  const { value, error } = schema.validate(data, {
    abortEarly: true,
  })

  if (error) {
    logger.error({
      message: 'Error on validate eagle system request vehicle ethical analysis',
    })

    throw new InternalServerError('Erro na validação do body para envio da análise etíca do veículo para Eagle System', error.stack as string)
  }

  return value
}

export default validateBody

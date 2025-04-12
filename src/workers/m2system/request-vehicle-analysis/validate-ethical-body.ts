import Joi from 'joi'

import { CompanyRequestVehicleConfigEnum } from '~/models/dynamo/enums/company'
import { VehicleType } from '~/models/dynamo/enums/request'
import { M2PlateStateEnum } from '~/models/m2system/enums/analysis'
import { M2VehicleRequestForms } from '~/models/m2system/request/analysis-vehicle'
import { M2SystemEthicalAnalysisConstructorResponse } from '~/use-cases/publish-sns-topic-vehicle/m2-ethical-analysis-constructor'
import InternalServerError from '~/utils/errors/500-internal-server-error'
import logger from '~/utils/logger'

const plateRegex = /^([A-Za-z0-9]{7})$/
const documentRegex = /^([0-9]{3}\.[0-9]{3}\.[0-9]{3}\-[0-9]{2}|[0-9]{2}\.[0-9]{3}\.[0-9]{3}\/[0-9]{4}\-[0-9]{2})$/

const schema = Joi.object<M2SystemEthicalAnalysisConstructorResponse>({
  data: Joi.object<M2VehicleRequestForms, true>({
    chassis: Joi
      .string()
      .max(255)
      .optional(),
    company_name: Joi
      .string()
      .max(255)
      .optional(),
    metadata: Joi
      .object()
      .optional(),
    driver_name: Joi
      .string()
      .max(255)
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
      .valid(...Object.values(M2PlateStateEnum))
      .required(),
    plate: Joi
      .string()
      .regex(plateRegex)
      .required(),
    postback: Joi
      .string()
      .equal('scoreplus')
      .optional(),
    renavam: Joi
      .string()
      .max(255)
      .optional(),
    vehicle_model: Joi
      .string()
      .max(255)
      .optional(),
    vehicle_type: Joi
      .string()
      .valid(...Object.values(VehicleType))
      .required(),
  }).required(),
  vehicle_analysis_option: Joi
    .string()
    .valid(CompanyRequestVehicleConfigEnum.ETHICAL)
    .required(),
}).required()

const validateEthicalBody = (
  data: Partial<M2SystemEthicalAnalysisConstructorResponse>,
): M2SystemEthicalAnalysisConstructorResponse => {
  const { value, error } = schema.validate(data, {
    abortEarly: true,
  })

  if (error) {
    logger.error({
      message: 'Error on validate m2 system request vehicle ethical analysis',
    })

    throw new InternalServerError('Erro na validação do body para envio da análise etíca do veículo para M2 System', error.stack as string)
  }

  return value
}

export default validateEthicalBody

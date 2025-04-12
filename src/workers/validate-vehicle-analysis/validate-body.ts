import Joi from 'joi'

import { CompanyRequestVehicleConfigEnum } from '~/models/dynamo/enums/company'
import { AnalysisResultEnum, PlateStateEnum } from '~/models/dynamo/enums/request'
import { UseCaseValidateVehicleAnalysisBody } from '~/use-cases/validate-vehicle-analysis'
import InternalServerError from '~/utils/errors/500-internal-server-error'
import logger from '~/utils/logger'

import { ValidateVehicleAnalysisWorkerMessageBody } from './main'

const schema = Joi.object<ValidateVehicleAnalysisWorkerMessageBody, true>({
  validations_body: Joi.array<UseCaseValidateVehicleAnalysisBody[]>().items(
    Joi.object<UseCaseValidateVehicleAnalysisBody, true>({
      reason: Joi
        .string()
        .when('result', {
          is: AnalysisResultEnum.REJECTED,
          then: Joi.required(),
          otherwise: Joi.optional(),
        }),
      result: Joi
        .string()
        .valid(...Object.values(AnalysisResultEnum))
        .required(),
      type: Joi
        .string()
        .valid(...Object.values(CompanyRequestVehicleConfigEnum))
        .required(),
      region: Joi
        .string()
        .when('type', {
          is: CompanyRequestVehicleConfigEnum.PLATE_HISTORY,
          then: Joi.valid(...Object.values(PlateStateEnum)).required(),
          otherwise: Joi.forbidden(),
        }),
    }).required()),
  request_id: Joi
    .string()
    .uuid()
    .required(),
  validation_user_id: Joi
    .string()
    .uuid()
    .required(),
  vehicle_id: Joi
    .string()
    .uuid()
    .required(),
}).required()

const validateBody = (
  data: Partial<ValidateVehicleAnalysisWorkerMessageBody>,
): ValidateVehicleAnalysisWorkerMessageBody => {
  const { value, error } = schema.validate(data, {
    abortEarly: true,
  })

  if (error) {
    logger.error({
      message: 'Error on validate validate vehicle analysis',
    })

    throw new InternalServerError('Erro na validação do body para validar análise de veículo', error.stack as string)
  }

  return value
}

export default validateBody

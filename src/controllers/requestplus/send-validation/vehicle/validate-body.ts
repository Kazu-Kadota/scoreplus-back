import Joi from 'joi'

import { CompanyRequestVehicleConfigEnum } from '~/models/dynamo/enums/company'
import { AnalysisResultEnum, PlateStateEnum } from '~/models/dynamo/enums/request'
import { SendAnswerVehicleValidationBody } from '~/models/dynamo/requestplus/validate-analysis-vehicle/table'
import BadRequestError from '~/utils/errors/400-bad-request'
import logger from '~/utils/logger'

export type ValidateSendAnswerVehicleBody = Omit<SendAnswerVehicleValidationBody, 'validated_at'>

const schema = Joi.array<ValidateSendAnswerVehicleBody[]>().items(
  Joi.object<ValidateSendAnswerVehicleBody, true>({
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
  }).required())

const validateBody = (
  data: Partial<ValidateSendAnswerVehicleBody[]>,
): ValidateSendAnswerVehicleBody[] => {
  const { value, error } = schema.validate(data, {
    abortEarly: true,
  })

  if (error) {
    logger.error({
      message: 'Error on validate "send validate vehicle" body',
    })

    throw new BadRequestError('Erro na validação do body para envio da validação da análise de veículos', error.stack as string)
  }

  return value
}

export default validateBody

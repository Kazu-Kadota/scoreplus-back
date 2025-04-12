import Joi from 'joi'

import { CompanyRequestVehicleConfigEnum } from '~/models/dynamo/enums/company'
import { PlateStateEnum } from '~/models/dynamo/enums/request'
import { UseCaseSendVehicleAnswersBody } from '~/use-cases/answer-vehicle-analysis'
import InternalServerError from '~/utils/errors/500-internal-server-error'
import logger from '~/utils/logger'

import { AnswerVehicleAnalysisWorkerMessageBody } from './main'

const schema = Joi.object<AnswerVehicleAnalysisWorkerMessageBody, true>({
  answers_body: Joi.array<UseCaseSendVehicleAnswersBody[]>().items(
    Joi.object<UseCaseSendVehicleAnswersBody, true>({
      reason: Joi
        .string()
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
  vehicle_id: Joi
    .string()
    .uuid()
    .required(),
}).required()

const validateBody = (
  data: Partial<AnswerVehicleAnalysisWorkerMessageBody>,
): AnswerVehicleAnalysisWorkerMessageBody => {
  const { value, error } = schema.validate(data, {
    abortEarly: true,
  })

  if (error) {
    logger.error({
      message: 'Error on validate answer vehicle analysis',
    })

    throw new InternalServerError('Erro na validação do body para responder análise de veículos', error.stack as string)
  }

  return value
}

export default validateBody

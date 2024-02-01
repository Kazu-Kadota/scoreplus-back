import Joi from 'joi'

import { CompanyRequestVehicleConfigEnum } from '~/models/dynamo/enums/company'
import { AnalysisResultEnum } from '~/models/dynamo/enums/request'
import { SendAnswerVehicleBody } from '~/models/dynamo/requestplus/finished-analysis-vehicle/table'
import BadRequestError from '~/utils/errors/400-bad-request'
import logger from '~/utils/logger'

const schema = Joi.array<SendAnswerVehicleBody[]>().items(
  Joi.object<SendAnswerVehicleBody, true>({
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
      .valid(CompanyRequestVehicleConfigEnum.ETHICAL, CompanyRequestVehicleConfigEnum.PLATE_HISTORY)
      .required(),
  }).required())

const validateBody = (
  data: Partial<SendAnswerVehicleBody[]>,
): SendAnswerVehicleBody[] => {
  const { value, error } = schema.validate(data, {
    abortEarly: true,
  })

  if (error) {
    logger.error({
      message: 'Error on validate "send answer vehicle" body',
    })

    throw new BadRequestError('Erro na validação do body para envio da resposta da análise de veículos', error.stack as string)
  }

  return value
}

export default validateBody

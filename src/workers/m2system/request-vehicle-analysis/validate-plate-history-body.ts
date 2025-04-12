import Joi from 'joi'

import { CompanyRequestVehicleConfigEnum } from '~/models/dynamo/enums/company'
import { M2PlateStateEnum, M2RequestAnalysisStateEnum } from '~/models/m2system/enums/analysis'
import { M2VehicleRequestPlateHistoryForms } from '~/models/m2system/request/analysis-vehicle-plate-history'
import { M2SystemPlateHistoryAnalysisConstructorResponse } from '~/use-cases/publish-sns-topic-vehicle/m2-plate-history-analysis-constructor'
import InternalServerError from '~/utils/errors/500-internal-server-error'
import logger from '~/utils/logger'

const plateRegex = /^([A-Za-z0-9]{7})$/
const documentRegex = /^([0-9]{3}\.[0-9]{3}\.[0-9]{3}\-[0-9]{2}|[0-9]{2}\.[0-9]{3}\.[0-9]{3}\/[0-9]{4}\-[0-9]{2})$/

const schema = Joi.array<M2SystemPlateHistoryAnalysisConstructorResponse[]>().items(Joi.object<M2SystemPlateHistoryAnalysisConstructorResponse>({
  data: Joi.object<M2VehicleRequestPlateHistoryForms, true>({
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
    region: Joi
      .string()
      .valid(...Object.values(M2RequestAnalysisStateEnum))
      .required(),
  }).required(),
  vehicle_analysis_option: Joi
    .string()
    .valid(CompanyRequestVehicleConfigEnum.PLATE_HISTORY)
    .required(),
}).required(),
)

const validatePlateHistoryBody = (
  data: Partial<M2SystemPlateHistoryAnalysisConstructorResponse[]>,
): M2SystemPlateHistoryAnalysisConstructorResponse[] => {
  const { value, error } = schema.validate(data, {
    abortEarly: true,
  })

  if (error) {
    logger.error({
      message: 'Error on validate m2 system request vehicle analysis',
    })

    throw new InternalServerError('Erro na validação do body para envio da análise de histórico de placa de veículo para M2 System', error.stack as string)
  }

  return value
}

export default validatePlateHistoryBody

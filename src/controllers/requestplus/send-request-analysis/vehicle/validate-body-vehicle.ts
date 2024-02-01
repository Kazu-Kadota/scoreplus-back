import Joi from 'joi'

import { CompanyRequestVehicleConfigEnum, CompanyVehicleAnalysisConfigEnum } from '~/models/dynamo/enums/company'

import { PlateStateEnum, VehicleType } from '~/models/dynamo/enums/request'
import { VehicleRequestForms } from '~/models/dynamo/requestplus/analysis-vehicle/forms'
import { RequestVehicleAnalysis } from '~/models/dynamo/requestplus/analysis-vehicle/table'
import { VehicleAnalysisOptionsToRequest } from '~/models/dynamo/requestplus/analysis-vehicle/vehicle-analysis-options'
import { VehicleAnalysisType } from '~/models/dynamo/requestplus/analysis-vehicle/vehicle-analysis-type'
import BadRequestError from '~/utils/errors/400-bad-request'
import logger from '~/utils/logger'

export type ValidateBodyVehicle = Omit<RequestVehicleAnalysis, 'vehicle_analysis_options'> & {
  vehicle_analysis_options_to_request: VehicleAnalysisOptionsToRequest
}

const plateRegex = /^([A-Za-z0-9]{7})$/
const documentRegex = /^([0-9]{3}\.?[0-9]{3}\.?[0-9]{3}\-?[0-9]{2}|[0-9]{2}\.?[0-9]{3}\.?[0-9]{3}\/?[0-9]{4}\-?[0-9]{2})$/

export const vehicle_schema = Joi.object<VehicleRequestForms, true>({
  chassis: Joi
    .string()
    .max(255)
    .optional(),
  company_name: Joi
    .string()
    .max(255)
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
    .valid(...Object.values(PlateStateEnum))
    .required(),
  plate: Joi
    .string()
    .regex(plateRegex)
    .required(),
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
})

export const vehicle_analysis_options_to_request_schema = Joi
  .array()
  .items(
    Joi.string().valid(...Object.values(CompanyRequestVehicleConfigEnum)),
  )

export const vehicle_analysis_type_schema = Joi.object<VehicleAnalysisType, true>({
  type: Joi
    .string()
    .valid(...Object.values(CompanyVehicleAnalysisConfigEnum))
    .required(),
})

const schema = Joi.object<ValidateBodyVehicle, true>({
  vehicle: vehicle_schema.required(),
  vehicle_analysis_options_to_request: vehicle_analysis_options_to_request_schema.required(),
  vehicle_analysis_type: vehicle_analysis_type_schema.required(),
})

const validateBodyVehicle = (
  data: Partial<ValidateBodyVehicle>,
): ValidateBodyVehicle => {
  const { value, error } = schema.validate(data, {
    abortEarly: true,
  })

  if (error) {
    logger.error({
      message: 'Error on validate "request vehicle" body',
    })

    throw new BadRequestError('Erro na validação do body para solicitação de análise de veículo', error.stack as string)
  }

  return value
}

export default validateBodyVehicle

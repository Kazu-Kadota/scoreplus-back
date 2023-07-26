import Joi from 'joi'
import { CompanyVehicleAnalysisConfigEnum } from 'src/models/dynamo/company'
import { PlateStateEnum, VehicleType } from 'src/models/dynamo/request-enum'
import {
  VehicleAnalysisConfig,
  VehicleRequestAnalysis,
  VehicleRequestForms,
} from 'src/models/dynamo/request-vehicle'

import ErrorHandler from 'src/utils/error-handler'
import logger from 'src/utils/logger'

const plateRegex = /^([A-Za-z0-9]{7})$/
const documentRegex = /^([0-9]{3}\.?[0-9]{3}\.?[0-9]{3}\-?[0-9]{2}|[0-9]{2}\.?[0-9]{3}\.?[0-9]{3}\/?[0-9]{4}\-?[0-9]{2})$/

const vehicle_schema = Joi.object<VehicleRequestForms>({
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

const vehicle_analysis_config_schema = Joi.object<VehicleAnalysisConfig>({
  type: Joi
    .string()
    .valid(...Object.values(CompanyVehicleAnalysisConfigEnum))
    .required(),
})

const schema = Joi.object<VehicleRequestAnalysis>({
  vehicle: vehicle_schema.required(),
  vehicle_analysis_config: vehicle_analysis_config_schema.required(),
})

const validateBodyVehicle = (
  data: Partial<VehicleRequestAnalysis>,
): VehicleRequestAnalysis => {
  const { value, error } = schema.validate(data, {
    abortEarly: true,
  })

  if (error) {
    logger.error('Error on validate "request vehicle" body')

    throw new ErrorHandler(error.stack as string, 400)
  }

  return value
}

export default validateBodyVehicle

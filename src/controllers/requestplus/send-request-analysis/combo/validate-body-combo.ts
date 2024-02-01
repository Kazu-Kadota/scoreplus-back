import Joi from 'joi'

import {
  ValidateBodyPerson,
  person_analysis_options_to_request_schema,
  person_analysis_type_schema,
  person_schema,
} from '../person/validate-body-person'
import {
  ValidateBodyVehicle,
  vehicle_analysis_options_to_request_schema,
  vehicle_analysis_type_schema,
  vehicle_schema,
} from '../vehicle/validate-body-vehicle'
import BadRequestError from '~/utils/errors/400-bad-request'
import logger from '~/utils/logger'

export type ValidateRequestCombo = ValidateBodyPerson & {
  combo_number: number
  vehicles: ValidateBodyVehicle[]
}

const vehicles_schema = Joi.array<ValidateBodyVehicle[]>().items(
  Joi.object<ValidateBodyVehicle>({
    vehicle: vehicle_schema.required(),
    vehicle_analysis_options_to_request: vehicle_analysis_options_to_request_schema.required(),
    vehicle_analysis_type: vehicle_analysis_type_schema.required(),
  }),
)

const schema = Joi.object<ValidateRequestCombo>({
  combo_number: Joi.number().min(0).max(10).required(),
  person: person_schema.required(),
  person_analysis_options_to_request: person_analysis_options_to_request_schema.required(),
  person_analysis_type: person_analysis_type_schema.required(),
  vehicles: vehicles_schema.required(),
}).required()

const validateBodyCombo = (
  data: Partial<ValidateRequestCombo>,
): ValidateRequestCombo => {
  const { value, error } = schema.validate(data, {
    abortEarly: true,
  })

  if (error) {
    logger.error({
      message: 'Error on validate "request combo" body',
    })

    throw new BadRequestError('Erro na validação do body para solicitação de análise de combo', error.stack as string)
  }

  return value
}

export default validateBodyCombo

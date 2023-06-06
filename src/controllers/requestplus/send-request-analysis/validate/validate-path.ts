import Joi from 'joi'
import { AnalysisTypeEnum } from 'src/models/dynamo/request-enum'

import ErrorHandler from 'src/utils/error-handler'
import logger from 'src/utils/logger'

export interface ValidatePath {
  analysis_type: AnalysisTypeEnum
}

const schema = Joi.object({
  analysis_type: Joi
    .string()
    .valid(...Object.values(AnalysisTypeEnum))
    .optional(),
}).required()

const validatePath = (
  data: Partial<ValidatePath | undefined>,
): ValidatePath => {
  const { value, error } = schema.validate(data, {
    abortEarly: true,
  })

  if (error) {
    logger.error('Error on validate answer analysis')

    throw new ErrorHandler(error.stack as string, 400)
  }

  return value
}

export default validatePath

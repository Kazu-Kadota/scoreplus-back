import Joi from 'joi'
import { ComboReleaseExtractKey } from 'src/models/dynamo/combo'

import ErrorHandler from 'src/utils/error-handler'
import logger from 'src/utils/logger'

const schema = Joi.object<ComboReleaseExtractKey>({
  combo_id: Joi
    .string()
    .uuid()
    .required(),
}).required()

const validateComboReleaseExtract = (
  data: Partial<ComboReleaseExtractKey>,
): ComboReleaseExtractKey => {
  const { value, error } = schema.validate(data, {
    abortEarly: true,
  })

  if (error) {
    logger.error('Error on validate "person release extract" body')

    throw new ErrorHandler(error.stack as string, 400)
  }

  return value
}

export default validateComboReleaseExtract

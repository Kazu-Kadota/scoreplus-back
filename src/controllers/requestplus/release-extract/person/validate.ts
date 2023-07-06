import Joi from 'joi'

import ErrorHandler from 'src/utils/error-handler'
import logger from 'src/utils/logger'

export interface ValidatePersonReleaseExtractParams {
  release_extract_id: string
}

const schema = Joi.object<ValidatePersonReleaseExtractParams>({
  release_extract_id: Joi
    .string()
    .uuid()
    .required(),
}).required()

const validatePersonReleaseExtract = (
  data: Partial<ValidatePersonReleaseExtractParams>,
): ValidatePersonReleaseExtractParams => {
  const { value, error } = schema.validate(data, {
    abortEarly: true,
  })

  if (error) {
    logger.error('Error on validate "person release extract" body')

    throw new ErrorHandler(error.stack as string, 400)
  }

  return value
}

export default validatePersonReleaseExtract

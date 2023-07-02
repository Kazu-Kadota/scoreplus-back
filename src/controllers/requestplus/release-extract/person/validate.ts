import Joi from 'joi'
import { PersonRequestKey } from 'src/models/dynamo/request-person'

import ErrorHandler from 'src/utils/error-handler'
import logger from 'src/utils/logger'

const schema = Joi.object<PersonRequestKey>({
  person_id: Joi
    .string()
    .uuid()
    .required(),
  request_id: Joi
    .string()
    .uuid()
    .required(),
}).required()

const validatePersonReleaseExtract = (
  data: Partial<PersonRequestKey>,
): PersonRequestKey => {
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

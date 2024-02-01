import Joi from 'joi'

import BadRequestError from '~/utils/errors/400-bad-request'
import logger from '~/utils/logger'

export type RecoveryPasswordRequest = {
  email: string
}

const schema = Joi.object<RecoveryPasswordRequest, true>({
  email: Joi
    .string()
    .email()
    .required(),
}).required()

const validateBody = (
  data: Partial<RecoveryPasswordRequest>,
): RecoveryPasswordRequest => {
  const { value, error } = schema.validate(data, {
    abortEarly: true,
  })

  if (error) {
    const message = 'Error on validate recovery password request'
    logger.error({
      message,
    })

    throw new BadRequestError(message, error.stack as string)
  }

  return value
}

export default validateBody

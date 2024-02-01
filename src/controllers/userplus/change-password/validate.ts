import Joi from 'joi'

import BadRequestError from '~/utils/errors/400-bad-request'
import logger from '~/utils/logger'

const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/

export type ChangePasswordRequest = {
  old_password: string
  password: string
}

const schema = Joi.object<ChangePasswordRequest, true>({
  old_password: Joi
    .string()
    .regex(passwordRegex)
    .required(),
  password: Joi
    .string()
    .regex(passwordRegex)
    .required(),
}).required()

const validateBody = (
  data: Partial<ChangePasswordRequest>,
): ChangePasswordRequest => {
  const { value, error } = schema.validate(data, {
    abortEarly: true,
  })

  if (error) {
    const message = 'Error on validate change password request'
    logger.error({
      message,
    })

    throw new BadRequestError(message, error.stack as string)
  }

  return value
}

export default validateBody

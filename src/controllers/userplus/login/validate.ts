import Joi from 'joi'

import BadRequestError from '~/utils/errors/400-bad-request'
import logger from '~/utils/logger'

const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/

export interface LoginRequest {
  email: string
  password: string
}

const schema = Joi.object<LoginRequest, true>({
  email: Joi
    .string()
    .email()
    .required(),
  password: Joi
    .string()
    .regex(passwordRegex)
    .required(),
}).required()

const validateLogin = (
  data: Partial<LoginRequest>,
): LoginRequest => {
  const { value, error } = schema.validate(data, {
    abortEarly: true,
  })

  if (error) {
    const message = 'Error on validate login request'
    logger.error({
      message,
    })

    throw new BadRequestError(message, error.stack as string)
  }

  return value
}

export default validateLogin

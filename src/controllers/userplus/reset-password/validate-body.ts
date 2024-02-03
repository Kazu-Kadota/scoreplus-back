import Joi from 'joi'

import BadRequestError from '~/utils/errors/400-bad-request'
import logger from '~/utils/logger'

const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/

export type ResetPasswordBodyRequest = {
  password: string
  confirm_password: string
}

const schema = Joi.object<ResetPasswordBodyRequest, true>({
  password: Joi
    .string()
    .regex(passwordRegex)
    .required(),
  confirm_password: Joi
    .string()
    .regex(passwordRegex)
    .required(),
}).required()

const validateBody = (
  data: Partial<ResetPasswordBodyRequest>,
): ResetPasswordBodyRequest => {
  const { value, error } = schema.validate(data, {
    abortEarly: true,
  })

  if (error) {
    const message = 'Error on validate reset password body request'
    logger.error({
      message,
    })

    throw new BadRequestError(message, error.stack as string)
  }

  return value
}

export default validateBody

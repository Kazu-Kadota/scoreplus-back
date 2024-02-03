import Joi from 'joi'

import BadRequestError from '~/utils/errors/400-bad-request'
import logger from '~/utils/logger'

export type ResetPasswordQueryRequest = {
  email: string
  recovery_id: string
}

const schema = Joi.object<ResetPasswordQueryRequest, true>({
  email: Joi
    .string()
    .email()
    .required(),
  recovery_id: Joi
    .string()
    .required(),
}).required()

const validateQuery = (
  data: Partial<ResetPasswordQueryRequest>,
): ResetPasswordQueryRequest => {
  const { value, error } = schema.validate(data, {
    abortEarly: true,
  })

  if (error) {
    const message = 'Error on validate reset password query request'
    logger.error({
      message,
    })

    throw new BadRequestError(message, error.stack as string)
  }

  return value
}

export default validateQuery

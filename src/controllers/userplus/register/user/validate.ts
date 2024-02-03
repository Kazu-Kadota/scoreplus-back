import Joi from 'joi'

import { UserGroupEnum } from '~/models/dynamo/enums/user'
import { UserplusUserBody } from '~/models/dynamo/userplus/user'
import BadRequestError from '~/utils/errors/400-bad-request'
import logger from '~/utils/logger'

const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/

export type ValidateRegisterParams = Omit<UserplusUserBody, 'company_id'>

const schema = Joi.object<ValidateRegisterParams, true>({
  user_first_name: Joi
    .string()
    .min(3)
    .max(255)
    .required(),
  user_last_name: Joi
    .string()
    .min(3)
    .max(255)
    .required(),
  email: Joi
    .string()
    .email()
    .required(),
  password: Joi
    .string()
    .regex(passwordRegex)
    .required(),
  user_type: Joi
    .string()
    .valid(...Object.values(UserGroupEnum))
    .required(),
  company_name: Joi
    .string()
    .max(255)
    .required(),
  api: Joi
    .boolean()
    .required(),
}).required()

const validateRegister = (
  data: Partial<ValidateRegisterParams>,
): ValidateRegisterParams => {
  const { value, error } = schema.validate(data, {
    abortEarly: true,
  })

  if (error) {
    const message = 'Error on validate register user request'
    logger.error({
      message,
    })

    throw new BadRequestError(message, error.stack as string)
  }

  return value
}

export default validateRegister

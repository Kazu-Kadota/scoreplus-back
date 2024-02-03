import { compareSync } from 'bcryptjs'

import { UserplusUser } from '~/models/dynamo/userplus/user'
import ErrorHandler from '~/utils/error-handler'
import logger from '~/utils/logger'

const validatePassword = (
  user: UserplusUser,
  password: string,
): void => {
  logger.debug({
    message: 'Validating password',
  })
  const isValidPassword = compareSync(password, user.password)

  if (!isValidPassword) {
    logger.warn({
      message: 'Old password is incorrect',
    })

    throw new ErrorHandler('Senha antiga está incorreto', 401)
  }
}

export default validatePassword

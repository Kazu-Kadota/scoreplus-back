import { compareSync } from 'bcryptjs'

import { UserplusUser } from '~/models/dynamo/userplus/user'
import UnauthorizedError from '~/utils/errors/401-unauthorized'
import logger from '~/utils/logger'

const validatePassword = (
  user: UserplusUser,
  password: string,
): void => {
  const isValidPassword = compareSync(password, user.password)

  if (!isValidPassword) {
    logger.warn({
      message: 'Invalid password',
    })

    throw new UnauthorizedError('Senha inválida')
  }
}

export default validatePassword

import axios from 'axios'
import { User } from 'src/models/dynamo/user'
import { Response } from 'src/models/lambda'
import ErrorHandler from 'src/utils/error-handler'
import getStringEnv from 'src/utils/get-string-env'
import logger from 'src/utils/logger'

export interface InvokeLoginParams {
  email: string
  password: string
}

export interface InvokeLoginResponse {
  message: string
  user: User
  jwtToken: string
  expires_date: string
}

const SCOREPLUS_USERPLUS_URL = getStringEnv('SCOREPLUS_USERPLUS_URL')

const invokeLogin = async ({
  email,
  password,
}: InvokeLoginParams): Promise<InvokeLoginResponse> => {
  logger.debug({
    message: 'SCOREPLUS: Request to login',
    password,
    email,
  })

  const options = {
    method: 'post',
    baseURL: SCOREPLUS_USERPLUS_URL,
    url: '/login',
    data: {
      email,
      password,
    },
  }

  const result = await axios
    .request<Response<any>>(options)
    .catch((err) => {
      logger.warn({
        message: 'SCOREPLUS: Error on login',
        error: err,
      })

      throw new ErrorHandler('SCOREPLUS: Error on login', 500)
    })

  return result.data
}

export default invokeLogin

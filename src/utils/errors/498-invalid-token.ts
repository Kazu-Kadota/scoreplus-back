import ErrorHandler from '../error-handler'

export default class InvalidTokenError extends ErrorHandler {
  constructor (message: string = 'Invalid Token', details?: any) {
    super(message, 498, details)
  }
}

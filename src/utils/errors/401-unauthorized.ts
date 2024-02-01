import ErrorHandler from '../error-handler'

export default class UnauthorizedError extends ErrorHandler {
  constructor (message: string = 'Unauthorized', details?: any) {
    super(message, 401, details)
    Object.setPrototypeOf(this, UnauthorizedError)
  }
}

import ErrorHandler from '../error-handler'

export default class MethodNotAllowedError extends ErrorHandler {
  constructor (message: string = 'Method not allowed', details?: any) {
    super(message, 405, details)
    Object.setPrototypeOf(this, MethodNotAllowedError)
  }
}

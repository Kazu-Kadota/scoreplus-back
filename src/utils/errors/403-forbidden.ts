import ErrorHandler from '../error-handler'

export default class ForbiddenError extends ErrorHandler {
  constructor (message: string = 'Forbidden', details?: any) {
    super(message, 403, details)
    Object.setPrototypeOf(this, ForbiddenError)
  }
}

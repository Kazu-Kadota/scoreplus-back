import ErrorHandler from '../error-handler'

export default class GoneError extends ErrorHandler {
  constructor (message: string = 'Gone', details?: any) {
    super(message, 410, details)
    Object.setPrototypeOf(this, GoneError)
  }
}

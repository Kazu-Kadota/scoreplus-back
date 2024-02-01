import ErrorHandler from '../error-handler'

export default class NotAcceptableError extends ErrorHandler {
  constructor (message: string = 'Not Acceptable', details?: any) {
    super(message, 406, details)
    Object.setPrototypeOf(this, NotAcceptableError)
  }
}

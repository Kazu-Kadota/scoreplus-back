import ErrorHandler from '../error-handler'

export default class LengthRequiredError extends ErrorHandler {
  constructor (message: string = 'Length Required', details?: any) {
    super(message, 411, details)
    Object.setPrototypeOf(this, LengthRequiredError)
  }
}

import ErrorHandler from '../error-handler'

export default class BadRequestError extends ErrorHandler {
  constructor (message: string = 'Bad Request', details?: any) {
    super(message, 400, details)
    Object.setPrototypeOf(this, BadRequestError)
  }
}

import ErrorHandler from '../error-handler'

export default class InternalServerError extends ErrorHandler {
  constructor (message: string = 'Internal Server Error', details?: any) {
    super(message, 500, details)
  }
}

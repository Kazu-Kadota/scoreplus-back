import ErrorHandler from '../error-handler'

export default class NotFoundError extends ErrorHandler {
  constructor (message: string = 'Not Found', details?: any) {
    super(message, 404, details)
  }
}

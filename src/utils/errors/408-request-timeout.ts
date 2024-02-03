import ErrorHandler from '../error-handler'

export default class RequestTimeoutError extends ErrorHandler {
  constructor (message: string = 'Request Timeout', details?: any) {
    super(message, 408, details)
  }
}

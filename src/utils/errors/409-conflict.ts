import ErrorHandler from '../error-handler'

export default class ConflictError extends ErrorHandler {
  constructor (message: string = 'Conflict', details?: any) {
    super(message, 409, details)
  }
}

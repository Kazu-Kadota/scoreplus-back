import ErrorHandler from '../error-handler'

export default class PaymentRequiredError extends ErrorHandler {
  constructor (message: string = 'Payment Required', details?: any) {
    super(message, 402, details)
  }
}

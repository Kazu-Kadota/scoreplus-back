import ErrorHandler from '../error-handler'

export default class ProxyAuthenticationRequiredError extends ErrorHandler {
  constructor (message: string = 'Proxy Authentication Required', details?: any) {
    super(message, 407, details)
  }
}

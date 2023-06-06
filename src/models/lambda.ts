import { APIGatewayProxyEventHeaders, APIGatewayProxyEventMultiValueHeaders } from 'aws-lambda'

export interface ReturnResponse<T> {
  body: T
}

export interface Response<T> extends ReturnResponse<T> {
  headers?: APIGatewayProxyEventHeaders
  multiValueHeaders?: APIGatewayProxyEventMultiValueHeaders
  statusCode?: number
}

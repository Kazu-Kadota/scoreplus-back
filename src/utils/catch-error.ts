import { APIGatewayProxyResult } from 'aws-lambda'

import { defaultHeaders } from '~/constants/headers'

import logger from './logger'

const catchError = (err: any): APIGatewayProxyResult => {
  if (err.isTreated) {
    logger.error({
      err: err.toObject(),
    })
    return {
      headers: defaultHeaders,
      statusCode: err.code,
      body: JSON.stringify(err.toObject()),
    }
  }

  if (err.$metadata) {
    logger.error({
      message: 'AWS error: ' + err.name,
      err,
    })
    return {
      headers: defaultHeaders,
      statusCode: err.$metadata.httpStatusCode,
      body: JSON.stringify({
        message: 'AWS error: ' + err.name,
      }),
    }
  }

  logger.error({
    message: 'Internal Server Error',
    err,
  })

  return {
    headers: defaultHeaders,
    statusCode: 500,
    body: JSON.stringify({
      message: 'Internal Server Error',
    }),
  }
}

export default catchError

export const catchErrorWorker = (err: any) => {
  if (err.isTreated) {
    return {
      success: false,
      statusCode: err.code,
      error: err.toObject(),
    }
  }

  if (err.$metadata) {
    return {
      success: false,
      statusCode: err.$metadata.httpStatusCode,
      error: err,
    }
  }

  return {
    success: false,
    statusCode: 500,
    error: 'Internal Server Error',
  }
}

import { APIGatewayProxyEvent } from 'aws-lambda'
import { defaultHeaders } from 'src/constants/headers'
import { Response } from 'src/models/lambda'
import catchError from 'src/utils/catch-error'
import ErrorHandler from 'src/utils/error-handler'
import extractJwtLambda from 'src/utils/extract-jwt-lambda'
import logger from 'src/utils/logger'

import companyHandler from './main'

export const handler = async (
  event: APIGatewayProxyEvent,
): Promise<Response<any>> => {
  try {
    logger.setRequestId(event.requestContext.requestId)
    const user_info = extractJwtLambda(event)

    if (!user_info) {
      throw new ErrorHandler('Usuário não autenticado', 403)
    }

    logger.debug({
      message: 'Start get company info',
      user_id: user_info.user_id,
    })

    const result = await companyHandler(user_info)

    return {
      headers: defaultHeaders,
      statusCode: 200,
      body: JSON.stringify(result),
    }
  } catch (err: any) {
    return catchError(err)
  }
}

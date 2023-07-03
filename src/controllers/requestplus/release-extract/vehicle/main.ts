import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { UserKey } from 'src/models/dynamo/user'
import { Controller, Request } from 'src/models/lambda'
import getUser from 'src/services/aws/dynamo/user/user/get'
import ErrorHandler from 'src/utils/error-handler'
import logger from 'src/utils/logger'

import generateVehiclePdf, { GenerateVehiclePdfParams } from './generate-vehicle-pdf'
import getCompanyAdapter from './get-company-adapter'
import getFinishedVehicleAnalysisAdapter from './get-finished-vehicle-analysis-adapter'
import validateVehicleReleaseExtract from './validate'

const dynamodbClient = new DynamoDBClient({
  region: 'us-east-1',
  maxAttempts: 5,
})

const vehicleReleaseExtractController: Controller = async (req: Request) => {
  logger.debug({
    message: 'Start path to get vehicle release extract',
  })

  const params = validateVehicleReleaseExtract({ ...req.queryStringParameters })

  const vehicle_analysis = await getFinishedVehicleAnalysisAdapter(params, dynamodbClient)

  const user_key: UserKey = {
    user_id: req.user_info?.user_id as string,
  }

  const user = await getUser(user_key, dynamodbClient)

  if (!user) {
    logger.warn({
      message: 'User not found',
      user_id: user_key.user_id,
    })

    throw new ErrorHandler('Usuário não encontrado', 404)
  }

  const company = await getCompanyAdapter(req.user_info?.company_name as string, dynamodbClient)

  const vehicle_data: GenerateVehiclePdfParams = {
    company,
    user,
    vehicle_analysis,
  }

  const pdf_buffer = await generateVehiclePdf(vehicle_data)

  logger.info({
    message: 'Finish on get vehicle release extract',
    vehicle_id: params.vehicle_id,
    request_id: params.request_id,
  })

  return {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=liberação_${vehicle_analysis.vehicle_id}_${vehicle_analysis.finished_at}.pdf`,
    },
    body: pdf_buffer,
    isBase64Encoded: true,
    notJsonBody: true,
  }
}

export default vehicleReleaseExtractController

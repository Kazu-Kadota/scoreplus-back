import { DynamoDBClient } from '@aws-sdk/client-dynamodb'

import getCompanyAdapter from '../get-company-adapter '
import getUserAdapter from '../get-user-adapter'
import verifyCompanyName from '../verify-company-name'
import { Controller } from '~/models/lambda'
import logger from '~/utils/logger'

import formatVehicleAnalysis from './format-vehicle-analysis'
import generateVehiclePdf from './generate-vehicle-pdf'
import getFinishedVehicleAnalysisAdapter from './get-finished-vehicle-analysis-adapter'
import validateVehicleReleaseExtract from './validate'

const dynamodbClient = new DynamoDBClient({
  region: 'us-east-1',
  maxAttempts: 5,
})

const vehicleReleaseExtractController: Controller<true> = async (req) => {
  logger.debug({
    message: 'Start path to get vehicle release extract',
  })

  const params = validateVehicleReleaseExtract({ ...req.queryStringParameters })

  const vehicle_analysis = await getFinishedVehicleAnalysisAdapter(params, dynamodbClient)

  const user = await getUserAdapter(req.user.user_id, dynamodbClient)

  const company = await getCompanyAdapter(vehicle_analysis.company_name, dynamodbClient)

  verifyCompanyName(user, vehicle_analysis)

  const pdf_buffer = await generateVehiclePdf({
    company,
    user,
    verification_code: params.request_id,
    vehicle_analysis: formatVehicleAnalysis(vehicle_analysis, company),
  })

  const pdf_base64 = Buffer.from(pdf_buffer).toString('base64')

  logger.info({
    message: 'Finish on get vehicle release extract',
    vehicle_id: params.vehicle_id,
    request_id: params.request_id,
  })

  return {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=liberacao_veiculo_${params.request_id}_${vehicle_analysis.finished_at?.split('T')[0]}.pdf`,
      'x-amazon-apigateway-binary-media-types': 'application/pdf',
    },
    body: pdf_base64,
    isBase64Encoded: true,
    notJsonBody: true,
  }
}

export default vehicleReleaseExtractController

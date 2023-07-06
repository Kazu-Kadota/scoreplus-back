import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { Controller, Request } from 'src/models/lambda'
import generatePdf from 'src/utils/generete-pdf'
import logger from 'src/utils/logger'

import getCompanyAdapter from '../get-company-adapter '
import getUserAdapter from '../get-user-adapter'
import renderTemplate from '../render-template'

import verifyCompanyName from '../verify-company-name'

import formatVehicleAnalysis from './format-vehicle-analysis'
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

  const user = await getUserAdapter(req.user_info?.user_id as string, dynamodbClient)

  const company = await getCompanyAdapter(vehicle_analysis.company_name, dynamodbClient)

  verifyCompanyName(user, vehicle_analysis)

  const vehicle_data = {
    company,
    user,
    verification_code: params.request_id,
    vehicle_analysis: formatVehicleAnalysis(vehicle_analysis, company),
  }

  const template = await renderTemplate('vehicle_release_extract.mustache', vehicle_data)

  const pdf_buffer = await generatePdf(template)

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

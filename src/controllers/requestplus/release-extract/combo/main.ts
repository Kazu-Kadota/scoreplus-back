import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { Controller, Request } from 'src/models/lambda'
import ErrorHandler from 'src/utils/error-handler'
import logger from 'src/utils/logger'

import getCompanyAdapter from '../get-company-adapter '
import getUserAdapter from '../get-user-adapter'
import formatPersonAnalysis from '../person/format-person-analysis'

import formatVehicleAnalysis from '../vehicle/format-vehicle-analysis'
import verifyCompanyName from '../verify-company-name'

import generateComboPdf from './generate-combo-pdf'
import getFinishedPersonAnalysisAdapter from './get-finished-person-analysis-adapter'
import getFinishedVehicleAnalysisAdapter from './get-finished-vehicle-analysis-adapter'
import validateComboReleaseExtract from './validate'
import verifyRequestPersonAnalysis from './verify-request-person-analysis'
import verifyRequestVehicleAnalysis from './verify-request-vehicle-analysis'

const dynamodbClient = new DynamoDBClient({
  region: 'us-east-1',
  maxAttempts: 5,
})

const comboReleaseExtractController: Controller = async (req: Request) => {
  logger.debug({
    message: 'Start path to get combo release extract',
  })

  const params = validateComboReleaseExtract({ ...req.queryStringParameters })

  const person_request_id = await verifyRequestPersonAnalysis(params, dynamodbClient)
  const vehicle_request_id = await verifyRequestVehicleAnalysis(params, dynamodbClient)

  if (person_request_id || vehicle_request_id) {
    throw new ErrorHandler('Ainda há análises pendentes e não é possível gerar o extrato de liberação.', 502, {
      person_request_id,
      vehicle_request_id,
    })
  }

  const person_analysis = await getFinishedPersonAnalysisAdapter(params, dynamodbClient)
  const vehicle_analysis = await getFinishedVehicleAnalysisAdapter(params, dynamodbClient)

  const user = await getUserAdapter(req.user_info?.user_id as string, dynamodbClient)

  const company = await getCompanyAdapter(person_analysis.company_name, dynamodbClient)

  verifyCompanyName(user, person_analysis)

  const pdf_buffer = await generateComboPdf({
    company,
    user,
    verification_code: params.combo_id,
    person_analysis: formatPersonAnalysis(person_analysis, company),
    vehicles_analysis: vehicle_analysis.map(analysis => formatVehicleAnalysis(analysis, company)),
  })

  const pdf_base64 = Buffer.from(pdf_buffer).toString('base64')

  logger.info({
    message: 'Finish on get combo release extract',
    combo_id: params.combo_id,
  })

  return {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=liberacao_combo_${params.combo_id}_${person_analysis.finished_at?.split('T')[0]}.pdf`,
      Accept: 'application/pdf',
    },
    body: pdf_base64,
    isBase64Encoded: true,
    notJsonBody: true,
  }
}

export default comboReleaseExtractController

import { DynamoDBClient } from '@aws-sdk/client-dynamodb'

import getCompanyAdapter from '../get-company-adapter '
import getUserAdapter from '../get-user-adapter'
import formatPersonAnalysis from '../person/format-person-analysis'
import formatVehicleAnalysis from '../vehicle/format-vehicle-analysis'
import { Controller } from '~/models/lambda'
import logger from '~/utils/logger'

import generateComboPdf from './generate-combo-pdf'
import getFinishedPersonAnalysisAdapter from './get-finished-person-analysis-adapter'
import getFinishedVehicleAnalysisAdapter from './get-finished-vehicle-analysis-adapter'
import validateComboReleaseExtract from './validate'
import verifyIsFinishedAnalysis from './verify-is-finished-analysis'

const dynamodbClient = new DynamoDBClient({
  region: 'us-east-1',
  maxAttempts: 5,
})

const comboReleaseExtractController: Controller<true> = async (req) => {
  logger.debug({
    message: 'Start path to get combo release extract',
  })

  const params = validateComboReleaseExtract({ ...req.queryStringParameters })

  await verifyIsFinishedAnalysis(params, dynamodbClient)

  const person_analysis = await getFinishedPersonAnalysisAdapter(params, dynamodbClient)
  const vehicle_analysis = await getFinishedVehicleAnalysisAdapter(params, dynamodbClient)

  const user = await getUserAdapter(req.user.user_id, dynamodbClient)

  const company = await getCompanyAdapter(person_analysis.company_name, dynamodbClient)

  // verifyCompanyName(user, person_analysis)

  const pdf_buffer = await generateComboPdf({
    company,
    user,
    verification_code: params.combo_id,
    person_analysis: formatPersonAnalysis(person_analysis, company),
    vehicles_analysis: vehicle_analysis.map(analysis => formatVehicleAnalysis(analysis, company)),
  })

  // @ts-ignore-next-line
  const pdf_base64 = Buffer.from(pdf_buffer).toString('base64')

  logger.info({
    message: 'Finish on get combo release extract',
    combo_id: params.combo_id,
  })

  return {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=liberacao_combo_${params.combo_id}_${person_analysis.finished_at?.split('T')[0]}.pdf`,
      'x-amazon-apigateway-binary-media-types': 'application/pdf',
    },
    body: pdf_base64,
    isBase64Encoded: true,
    notJsonBody: true,
  }
}

export default comboReleaseExtractController

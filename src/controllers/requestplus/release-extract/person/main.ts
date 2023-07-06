import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { Controller, Request } from 'src/models/lambda'
import generatePdf from 'src/utils/generete-pdf'
import logger from 'src/utils/logger'

import getCompanyAdapter from '../get-company-adapter '
import getUserAdapter from '../get-user-adapter'
import renderTemplate from '../render-template'

import verifyCompanyName from '../verify-company-name'

import formatPersonAnalysis from './format-person-analysis'
import getFinishedPersonAnalysisAdapter from './get-finished-person-analysis-adapter'
import validatePersonReleaseExtract from './validate'
import verifyRequestPersonAnalysis from './verify-request-person-analysis'

const dynamodbClient = new DynamoDBClient({
  region: 'us-east-1',
  maxAttempts: 5,
})

const personReleaseExtractController: Controller = async (req: Request) => {
  logger.debug({
    message: 'Start path to get person release extract',
  })

  const params = validatePersonReleaseExtract({ ...req.queryStringParameters })

  await verifyRequestPersonAnalysis(params, dynamodbClient)

  const person_analysis = await getFinishedPersonAnalysisAdapter(params, dynamodbClient)

  const user = await getUserAdapter(req.user_info?.user_id as string, dynamodbClient)

  const company = await getCompanyAdapter(person_analysis.company_name, dynamodbClient)

  verifyCompanyName(user, person_analysis)

  const pdfData = {
    company,
    user,
    verification_code: params.release_extract_id,
    person_analysis: formatPersonAnalysis(person_analysis, company),
  }

  const template = await renderTemplate('person_release_extract.mustache', pdfData)

  const pdf_buffer = await generatePdf(template)

  logger.info({
    message: 'Finish on get person release extract',
    release_extract_id: params.release_extract_id,
  })

  return {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=liberação_${person_analysis.name}_${person_analysis.finished_at}.pdf`,
    },
    body: pdf_buffer,
    isBase64Encoded: true,
    notJsonBody: true,
  }
}

export default personReleaseExtractController

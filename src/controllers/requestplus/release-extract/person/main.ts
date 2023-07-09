import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { Controller, Request } from 'src/models/lambda'
import logger from 'src/utils/logger'

import getCompanyAdapter from '../get-company-adapter '
import getUserAdapter from '../get-user-adapter'

import verifyCompanyName from '../verify-company-name'

import formatPersonAnalysis from './format-person-analysis'
import generatePersonPdf from './generate-person-pdf'
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

  const pdf_buffer = await generatePersonPdf({
    company,
    user,
    verification_code: params.release_extract_id,
    person_analysis: formatPersonAnalysis(person_analysis, company),
  })

  logger.info({
    message: 'Finish on get person release extract',
    release_extract_id: params.release_extract_id,
  })

  return {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=liberacao_${person_analysis.name}_${person_analysis.finished_at?.split('T')[0]}.pdf`,
    },
    body: pdf_buffer,
    isBase64Encoded: true,
    notJsonBody: true,
  }
}

export default personReleaseExtractController

import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { UserKey } from 'src/models/dynamo/user'
import { Controller, Request } from 'src/models/lambda'
import getUser from 'src/services/aws/dynamo/user/user/get'
import ErrorHandler from 'src/utils/error-handler'
import generatePdf from 'src/utils/generete-pdf'
import logger from 'src/utils/logger'

import renderTemplate from '../render-template'

import formatPersonAnalysis from './format-person-analysis'
import getCompanyAdapter from './get-company-adapter'
import getFinishedPersonAnalysisAdapter from './get-finished-person-analysis-adapter'
import validatePersonReleaseExtract from './validate'

const dynamodbClient = new DynamoDBClient({
  region: 'us-east-1',
  maxAttempts: 5,
})

const personReleaseExtractController: Controller = async (req: Request) => {
  logger.debug({
    message: 'Start path to get person release extract',
  })

  const params = validatePersonReleaseExtract({ ...req.queryStringParameters })

  const person_analysis = await getFinishedPersonAnalysisAdapter(params, dynamodbClient)

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

  const pdfData = {
    company,
    user,
    verification_code: 'MOCK', // TODO: Remove it
    person_analysis: formatPersonAnalysis(person_analysis),
  }

  const template = await renderTemplate('person_release_extract.mustache', pdfData)

  const pdf_buffer = await generatePdf(template)

  logger.info({
    message: 'Finish on get person release extract',
    person_id: params.person_id,
    request_id: params.request_id,
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

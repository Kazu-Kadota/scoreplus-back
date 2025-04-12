import { DynamoDBClient } from '@aws-sdk/client-dynamodb'

import getCompanyAdapter from '../get-company-adapter '
import getUserAdapter from '../get-user-adapter'
import { UserGroupEnum } from '~/models/dynamo/enums/user'
import { UserplusCompany } from '~/models/dynamo/userplus/company'
import { Controller } from '~/models/lambda'
import logger from '~/utils/logger'

import formatPersonAnalysis from './format-person-analysis'
import generatePersonPdf from './generate-person-pdf'
import getFinishedPersonAnalysisAdapter from './get-finished-person-analysis-adapter'
import validatePersonReleaseExtract from './validate'

const dynamodbClient = new DynamoDBClient({
  region: 'us-east-1',
  maxAttempts: 5,
})

const personReleaseExtractController: Controller<true> = async (req) => {
  logger.debug({
    message: 'Start path to get person release extract',
  })

  const params = validatePersonReleaseExtract({ ...req.queryStringParameters })

  const person_analysis = await getFinishedPersonAnalysisAdapter(params, dynamodbClient)

  const user = await getUserAdapter(req.user.user_id, dynamodbClient)

  const company = await getCompanyAdapter(person_analysis.company_name, dynamodbClient)

  let user_company

  if (user.user_type === UserGroupEnum.CLIENT && user.company_name !== person_analysis.company_name) {
    user_company = await getCompanyAdapter(user.company_name, dynamodbClient)
  } else if (user.user_type === UserGroupEnum.CLIENT && user.company_name === person_analysis.company_name) {
    user_company = company
  }

  // verifyCompanyName(user, person_analysis)

  const pdf_buffer = await generatePersonPdf({
    company: user.user_type === UserGroupEnum.CLIENT ? user_company as UserplusCompany : company,
    user,
    verification_code: params.request_id,
    person_analysis: formatPersonAnalysis(person_analysis, company),
  })

  // @ts-ignore-next-line
  const pdf_base64 = Buffer.from(pdf_buffer).toString('base64')

  logger.info({
    message: 'Finish on get person release extract',
    person_id: params.person_id,
    request_id: params.request_id,
  })

  return {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=liberacao_pessoa_${params.request_id}_${person_analysis.finished_at?.split('T')[0]}.pdf`,
      'x-amazon-apigateway-binary-media-types': 'application/pdf',
    },
    body: pdf_base64,
    isBase64Encoded: true,
    notJsonBody: true,
  }
}

export default personReleaseExtractController

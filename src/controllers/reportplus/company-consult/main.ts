import { DynamoDBClient } from '@aws-sdk/client-dynamodb'

import { defaultHeaders } from '~/constants/headers'
import { Controller } from '~/models/lambda'
import logger from '~/utils/logger'

import checkRulesAndCompanyName from './check-rules-and-company-name'

import convertCsv from './convert-csv'
import getCompanyAdapter from './get-company-adapter'
import getCompanyConsultAdapter from './get-company-consult-adapter'
import validateCompanyConsultQuery from './validate-report-query'

const dynamodbClient = new DynamoDBClient({ region: 'us-east-1' })

const reportPersonAnalysis: Controller<true> = async (req) => {
  logger.debug({
    message: 'Start request company consult report path',
  })

  const { month, year, company, summary } = validateCompanyConsultQuery({ ...req.queryStringParameters })

  const year_month = `${year}-${month}`

  const company_name = checkRulesAndCompanyName({
    user: req.user,
    company,
  })

  const company_info = await getCompanyAdapter(company_name, dynamodbClient)

  const company_consult = await getCompanyConsultAdapter({
    company_id: company_info.company_id,
    dynamodbClient,
    year_month,
  })

  if (!company_consult) {
    return {
      body: {
        message: 'Não há processo de consulta desta empresa para este mês e ano',
        year_month,
      },
      statusCode: 204,
    }
  }

  const csv = convertCsv({
    company_consult,
    summary,
  })

  logger.info({
    message: 'Finish on generate person report',
    year_month,
  })

  return {
    headers: {
      ...defaultHeaders,
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename=company_consult_report_${new Date().toISOString().split('T')[0]}_${summary ? 'summarized' : 'detailed'}.csv`,
    },
    statusCode: 200,
    body: csv,
    notJsonBody: true,
  }
}

export default reportPersonAnalysis

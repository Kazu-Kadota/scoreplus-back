import { DynamoDBClient } from '@aws-sdk/client-dynamodb'

import checkRulesAndCompanyName from '../check-rules-and-company-name'
import getCompanyAdapter from '../get-company-adapter'
import { defaultHeaders } from '~/constants/headers'
import { Controller } from '~/models/lambda'
import logger from '~/utils/logger'

import convertCsv from './convert-csv'
import personReport from './person-report'
import validateReportQuery from './validate-report-query'

const dynamodbClient = new DynamoDBClient({ region: 'us-east-1' })

const reportPersonAnalysis: Controller<true> = async (req) => {
  logger.debug({
    message: 'Start request person report path',
  })

  const { company, ...query } = validateReportQuery({ ...req.queryStringParameters })

  const query_final_date = new Date(query.final_date)
  query_final_date.setDate(query_final_date.getDate() + 1)
  const final_date = query_final_date.toISOString()

  const company_name = checkRulesAndCompanyName({
    query,
    user: req.user,
    company,
  })

  const company_info = await getCompanyAdapter(company_name, dynamodbClient)

  const data = {
    ...query,
    final_date,
    company_name,
  }

  const person_report = await personReport(data, dynamodbClient)

  const csv = convertCsv({
    person_report,
    user: req.user,
    company: company_info,
  })

  logger.info({
    message: 'Finish on generate person report',
    ...data,
    count: person_report.count,
  })

  return {
    headers: {
      ...defaultHeaders,
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename=person_report_${new Date().toISOString().split('T')[0]}.csv`,
    },
    statusCode: 200,
    body: csv,
  }
}

export default reportPersonAnalysis

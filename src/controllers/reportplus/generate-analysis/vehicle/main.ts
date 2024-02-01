import { DynamoDBClient } from '@aws-sdk/client-dynamodb'

import checkRulesAndCompanyName from '../check-rules-and-company-name'
import getCompanyAdapter from '../get-company-adapter'
import { defaultHeaders } from '~/constants/headers'
import { Controller } from '~/models/lambda'
import logger from '~/utils/logger'

import convertCsv from './convert-csv'
import validateReportQuery from './validate-report-query'
import vehicleReport from './vehicle-report'

const dynamodbClient = new DynamoDBClient({ region: 'us-east-1' })

const reportVehicleAnalysis: Controller<true> = async (req) => {
  logger.debug({
    message: 'Start request vehicle report path',
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

  logger.debug({
    message: 'Creating vehicle report',
    start_date: data.start_date,
    final_date: data.final_date,
    company_name: data.company_name,
  })

  const vehicle_report = await vehicleReport(data, dynamodbClient)

  const csv = convertCsv({
    company: company_info,
    user: req.user,
    vehicle_report,
  })

  logger.info({
    message: 'Finish on generate vehicle report',
    start_date: data.start_date,
    final_date: data.final_date,
    company_name,
    count: vehicle_report.count,
  })

  return {
    headers: {
      ...defaultHeaders,
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename=vehicle_report_${new Date().toISOString().split('T')[0]}.csv`,
    },
    statusCode: 200,
    body: csv,
  }
}

export default reportVehicleAnalysis

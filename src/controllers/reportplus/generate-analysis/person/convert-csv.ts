import { stringify } from 'csv-stringify/sync'

import { companyRequestPersonConfigEnum } from '~/constants/company'
import { CompanyRequestPersonConfigEnum } from '~/models/dynamo/enums/company'
import { UserplusCompany } from '~/models/dynamo/userplus/company'
import { UserFromJwt } from '~/utils/extract-jwt-lambda'
import logger from '~/utils/logger'
import removeEmpty from '~/utils/remove-empty'

import { PersonReportResponse } from './person-report'

export type ConvertCsvParams = {
  user: UserFromJwt
  person_report: PersonReportResponse
  company: UserplusCompany
}

export type PersonReportCSVPersonConfig = {
  [Key in CompanyRequestPersonConfigEnum]?: string
}

export type PersonReportCSVHeader = PersonReportCSVPersonConfig & {
  analysis_type: string
  combo_id?: string
  combo_number?: string
  company_name: string
  created_at: string
  document: string
  finished_at?: string
  name: string
  person_id: string
  request_id: string
  result?: string
}

const convertCsv = ({
  person_report,
  user,
  company,
}: ConvertCsvParams) => {
  logger.debug({
    message: 'Converting person analysis to CSV',
  })

  const person_config = new Set<CompanyRequestPersonConfigEnum>()

  const person_analysis_options: PersonReportCSVPersonConfig = {}

  for (const [config, bool] of Object.entries(company.request_person_config)) {
    if (bool) {
      const request_person_config = config as CompanyRequestPersonConfigEnum
      person_config.add(request_person_config)
    }
  }

  for (const config of person_config) {
    person_analysis_options[config] = companyRequestPersonConfigEnum[config]
  }

  const columns: PersonReportCSVHeader = removeEmpty({
    company_name: 'Nome da empresa',
    request_id: 'ID da requisição',
    person_id: 'ID da pessoa',
    name: 'Nome',
    document: 'Documento',
    analysis_type: 'Tipo de análise da pessoa',
    combo_id: 'ID do combo',
    combo_number: 'Número de requisições dentro do combo',
    ethical: person_analysis_options.ethical,
    history: person_analysis_options.history,
    'basic-data': person_analysis_options['basic-data'],
    'biometry-basic': person_analysis_options['biometry-basic'],
    // 'biometry-cnh': person_analysis_options['biometry-cnh'],
    'biometry-facial': person_analysis_options['biometry-facial'],
    'cnh-advanced': person_analysis_options['cnh-advanced'],
    'cnh-simple': person_analysis_options['cnh-simple'],
    process: person_analysis_options.process,
    created_at: 'Data de criação da análise',
    finished_at: 'Data de resposta da análise',
  })

  if (user.user_type === 'admin') {
    columns.result = 'Resposta da análise'
  }

  return stringify(person_report.result, {
    header: true,
    columns,
    bom: true,
  })
}

export default convertCsv

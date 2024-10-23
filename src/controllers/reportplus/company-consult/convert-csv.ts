import { stringify } from 'csv-stringify/sync'

import { RequestplusCompanyConsultRequests } from '~/models/dynamo/requestplus/company-consult/requests'
import { RequestplusCompanyConsult } from '~/models/dynamo/requestplus/company-consult/table'
import logger from '~/utils/logger'
import removeEmpty from '~/utils/remove-empty'

export type ConvertCsvParams = {
  company_consult: RequestplusCompanyConsult
  summary: boolean
}

export type CsvColumnsSummarized = Omit<{
  [Key in keyof RequestplusCompanyConsult]: string
}, 'requests'>

export type CsvColumnsDetailed = RequestplusCompanyConsultRequests & {
  company_id: string
  company_name: string
}

const convertCsv = ({
  company_consult,
  summary,
}: ConvertCsvParams) => {
  logger.debug({
    message: 'Converting company consult to CSV',
  })

  if (summary) {
    const columns: CsvColumnsSummarized = removeEmpty({
      company_id: 'ID da empresa',
      company_name: 'Nome da empresa',
      year_month: 'Ano-Mês',
      number_of_request: 'Números de requisições de consulta',
      created_at: 'Data de criação da análise',
      updated_at: 'Data da última atualização da análise',
    })

    return stringify([company_consult], {
      header: true,
      columns,
      bom: true,
    })
  } else {
    const company_consult_requests_detailed = company_consult.requests.map<CsvColumnsDetailed>((request) => {
      return {
        ...request,
        company_id: company_consult.company_id,
        company_name: company_consult.company_name,
      }
    })

    const columns: CsvColumnsDetailed = removeEmpty({
      company_id: 'ID da empresa',
      company_name: 'Nome da empresa',
      date_of_request: 'Data da consulta',
      user_id: 'ID do usuário',
      request_id: 'ID da requisição',
      person_id: 'ID da pessoa analisada',
      vehicle_id: 'ID do veículo analisado',
    })

    return stringify(company_consult_requests_detailed, {
      header: true,
      columns,
      bom: true,
    })
  }
}

export default convertCsv

import { stringify } from 'csv-stringify/sync'

import { companyRequestVehicleConfigEnum } from '~/constants/company'
import { CompanyRequestVehicleConfigEnum } from '~/models/dynamo/enums/company'
import { UserplusCompany } from '~/models/dynamo/userplus/company'
import { UserFromJwt } from '~/utils/extract-jwt-lambda'
import logger from '~/utils/logger'

import removeEmpty from '~/utils/remove-empty'

import { VehicleReportResponse } from './vehicle-report'

export type ConvertCsvParams = {
  user: UserFromJwt
  vehicle_report: VehicleReportResponse
  company: UserplusCompany
}

export type VehicleReportCSVVehicleConfig = {
  [Key in CompanyRequestVehicleConfigEnum]?: string
}

export type VehicleReportCSVHeader = VehicleReportCSVVehicleConfig & {
  combo_id?: string
  combo_number?: string
  company_name: string
  created_at: string
  finished_at?: string
  owner_document: string
  owner_name: string
  plate: string
  request_id: string
  result?: string
  vehicle_id: string
  vehicle_type: string
}

const convertCsv = ({
  vehicle_report,
  user,
  company,
}: ConvertCsvParams) => {
  logger.debug({
    message: 'Converting vehicle analysis to CSV',
  })

  const vehicle_config = new Set<CompanyRequestVehicleConfigEnum>()

  const vehicle_analysis_options: VehicleReportCSVVehicleConfig = {}

  for (const [config, bool] of Object.entries(company.request_person_config)) {
    if (bool) {
      const request_person_config = config as CompanyRequestVehicleConfigEnum
      vehicle_config.add(request_person_config)
    }
  }

  for (const config of vehicle_config) {
    vehicle_analysis_options[config] = companyRequestVehicleConfigEnum[config]
  }

  const columns: VehicleReportCSVHeader = removeEmpty({
    company_name: 'Nome da empresa',
    request_id: 'ID da requisição',
    vehicle_id: 'ID do veículo',
    plate: 'Placa',
    vehicle_type: 'Tipo do veículo',
    owner_name: 'Nome do dono',
    owner_document: 'Documento do dono',
    ethical: vehicle_analysis_options.ethical,
    'plate-history': vehicle_analysis_options['plate-history'],
    // antt: vehicle_analysis_options.antt,
    // cronotacografo: vehicle_analysis_options.cronotacografo,
    combo_id: 'ID do combo',
    combo_number: 'Número de requisições dentro do combo',
    created_at: 'Data de criação da análise',
    finished_at: 'Data de resposta da análise',
  })

  if (user.user_type === 'admin') {
    columns.result = 'Resposta da análise'
  }

  return stringify(vehicle_report.result, {
    header: true,
    columns,
    bom: true,
  })
}

export default convertCsv

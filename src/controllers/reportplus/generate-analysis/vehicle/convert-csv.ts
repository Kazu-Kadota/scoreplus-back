import { stringify } from 'csv-stringify/sync'

import { companyRequestVehicleConfigEnum } from '~/constants/company'
import { CompanyRequestVehicleConfigEnum } from '~/models/dynamo/enums/company'
import { UserplusCompany } from '~/models/dynamo/userplus/company'
import { UserFromJwt } from '~/utils/extract-jwt-lambda'
import logger from '~/utils/logger'

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
  company_name: string
  request_id: string
  vehicle_id: string
  plate: string
  vehicle_type: string
  owner_name: string
  owner_document: string
  combo_number?: string
  result?: string
  created_at: string
  finished_at?: string
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

  const columns: VehicleReportCSVHeader = {
    company_name: 'Nome da empresa',
    request_id: 'ID da requisição',
    vehicle_id: 'ID do veículo',
    plate: 'Placa',
    vehicle_type: 'Tipo do veículo',
    owner_name: 'Nome do dono',
    owner_document: 'Documento do dono',
    combo_number: 'Número de requisições dentro do combo',
    created_at: 'Data de criação da análise',
    finished_at: 'Data de resposta da análise',
  }

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

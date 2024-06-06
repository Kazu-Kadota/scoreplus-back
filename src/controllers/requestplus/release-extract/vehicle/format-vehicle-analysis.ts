import dayjs from 'dayjs'

import { companyAnalysisConfigStrings } from '~/constants/company'
import { CompanyVehicleAnalysisConfigEnum } from '~/models/dynamo/enums/company'
import { AnalysisResultEnum } from '~/models/dynamo/enums/request'
import { RequestplusFinishedAnalysisVehicle } from '~/models/dynamo/requestplus/finished-analysis-vehicle/table'
import { UserplusCompany } from '~/models/dynamo/userplus/company'

export type PdfVehicleRequest = RequestplusFinishedAnalysisVehicle & {
  validity: string
  analysis_config_string?: string
}

const formatVehicleAnalysis = (analysis: RequestplusFinishedAnalysisVehicle, company: UserplusCompany) => {
  let validity: string

  if (analysis.vehicle_analysis_type.type === CompanyVehicleAnalysisConfigEnum.AUTONOMOUS) {
    validity = 'Embarque único'
  } else {
    const finished_at = dayjs(analysis.finished_at).toDate()
    finished_at.setDate(finished_at.getDate() + company.analysis_config[analysis.vehicle_analysis_type.type])

    validity = dayjs(finished_at.toISOString()).format('DD/MM/YYYY')
  }

  if (analysis.result !== AnalysisResultEnum.APPROVED) {
    validity = 'Inadequado'
  }

  const vehicle_analysis: PdfVehicleRequest = { ...analysis, validity }

  if (vehicle_analysis.vehicle_analysis_type?.type) {
    vehicle_analysis.analysis_config_string = companyAnalysisConfigStrings[analysis.vehicle_analysis_type.type]
  }

  return vehicle_analysis
}

export default formatVehicleAnalysis

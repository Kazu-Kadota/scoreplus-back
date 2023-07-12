import dayjs from 'dayjs'
import { companyAnalysisConfigStrings } from 'src/constants/company'
import { AnalysisResultEnum } from 'src/models/dynamo/answer'
import { Company, CompanyVehicleAnalysisConfigEnum } from 'src/models/dynamo/company'
import { VehicleRequest } from 'src/models/dynamo/request-vehicle'

export interface PdfVehicleRequest extends VehicleRequest {
  validity: string;
  analysis_config_string?: string;
}

const formatVehicleAnalysis = (analysis: VehicleRequest, company: Company) => {
  let validity: string

  if (analysis.vehicle_analysis_config.type === CompanyVehicleAnalysisConfigEnum.AUTONOMOUS) {
    validity = 'Próximo embarque'
  } else {
    const finished_at = dayjs(analysis.finished_at).toDate()
    finished_at.setDate(finished_at.getDate() + company.analysis_config[analysis.vehicle_analysis_config.type])

    validity = dayjs(finished_at.toISOString()).format('DD/MM/YYYY')
  }

  if (analysis.analysis_result !== AnalysisResultEnum.APPROVED) {
    validity = 'Inadequado para embarque'
  }

  const vehicle_analysis: PdfVehicleRequest = { ...analysis, validity }

  if (vehicle_analysis.vehicle_analysis_config?.type) {
    vehicle_analysis.analysis_config_string = companyAnalysisConfigStrings[analysis.vehicle_analysis_config.type]
  }

  return vehicle_analysis
}

export default formatVehicleAnalysis

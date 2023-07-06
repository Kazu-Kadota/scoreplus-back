import dayjs from 'dayjs'
import { analysisResultStrings } from 'src/constants/answer'
import { AnalysisResultEnum } from 'src/models/dynamo/answer'
import { Company, CompanyVehicleAnalysisConfigEnum } from 'src/models/dynamo/company'
import { VehicleRequest } from 'src/models/dynamo/request-vehicle'

export interface PdfVehicleRequest extends VehicleRequest {
  isApproved: boolean;
  validity: string;
  finished_at_formatted: string;
  analysis_config_string: string;
  analysis_result_string?: string;
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

  const vehicle_analysis: PdfVehicleRequest = {
    ...analysis,
    analysis_config_string: 'Frota',
    finished_at_formatted: dayjs(analysis.finished_at).format('DD/MM/YYYY'),
    isApproved: analysis.analysis_result === AnalysisResultEnum.APPROVED,
    validity,
  }

  if (analysis.analysis_result) {
    vehicle_analysis.analysis_result_string = analysisResultStrings[analysis.analysis_result as AnalysisResultEnum]
  }

  return vehicle_analysis
}

export default formatVehicleAnalysis

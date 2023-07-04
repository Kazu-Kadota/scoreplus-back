import dayjs from 'dayjs'

import { analysisResultStrings } from 'src/constants/answer'

import { AnalysisResultEnum } from 'src/models/dynamo/answer'

import { VehicleRequest } from 'src/models/dynamo/request-vehicle'

export interface PdfVehicleRequest extends VehicleRequest {
  isApproved: boolean;
  created_at_formatted: string;
  finished_at_formatted: string;
  analysis_config_string: string;
  analysis_result_string?: string;
}

const formatVehicleAnalysis = (analysis: VehicleRequest) => {
  const vehicle_analysis: PdfVehicleRequest = {
    ...analysis,
    isApproved: analysis.analysis_result === AnalysisResultEnum.APPROVED,
    created_at_formatted: dayjs(analysis.created_at).format('DD/MM/YYYY'),
    finished_at_formatted: dayjs(analysis.finished_at).format('DD/MM/YYYY'),
    analysis_config_string: 'Frota',
  }

  if (analysis.analysis_result) {
    vehicle_analysis.analysis_result_string = analysisResultStrings[analysis.analysis_result as AnalysisResultEnum]
  }

  return vehicle_analysis
}

export default formatVehicleAnalysis

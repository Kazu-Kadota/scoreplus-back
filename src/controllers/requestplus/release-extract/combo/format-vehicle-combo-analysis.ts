import { Company } from 'src/models/dynamo/company'
import { VehicleRequest } from 'src/models/dynamo/request-vehicle'

import formatVehicleAnalysis from '../vehicle/format-vehicle-analysis'

const formatVehicleComboAnalysis = (vehicleAnalysisList: VehicleRequest[], company: Company) => {
  const vehicleAnalysisItems = vehicleAnalysisList.map((analysis, index) => ({
    index,
    item: formatVehicleAnalysis(analysis, company),
  }))

  return vehicleAnalysisItems
}

export default formatVehicleComboAnalysis

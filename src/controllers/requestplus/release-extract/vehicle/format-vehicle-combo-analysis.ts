import { VehicleRequest } from 'src/models/dynamo/request-vehicle'

import formatVehicleAnalysis from './format-vehicle-analysis'

const formatVehicleComboAnalysis = (vehicleAnalysisList: VehicleRequest[]) => {
  const vehicleAnalysisItems = vehicleAnalysisList.map((analysis, index) => ({
    index,
    item: formatVehicleAnalysis(analysis),
  }))

  return vehicleAnalysisItems
}

export default formatVehicleComboAnalysis

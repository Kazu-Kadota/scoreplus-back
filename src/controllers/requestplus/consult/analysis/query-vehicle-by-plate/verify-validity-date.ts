import dayjs from 'dayjs'

import { RequestplusFinishedAnalysisVehicle } from '~/models/dynamo/requestplus/finished-analysis-vehicle/table'
import { UserplusCompany } from '~/models/dynamo/userplus/company'

const verifyValidityDate = (finished_vehicle: RequestplusFinishedAnalysisVehicle, company: UserplusCompany) => {
  const finished_at = dayjs(finished_vehicle.finished_at).toDate()
  finished_at.setDate(finished_at.getDate() + company.analysis_config[finished_vehicle.vehicle_analysis_type.type])

  return dayjs(finished_at.toISOString()).format('DD/MM/YYYY')
}

export default verifyValidityDate

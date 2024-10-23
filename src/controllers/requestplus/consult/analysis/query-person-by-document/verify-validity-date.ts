import dayjs from 'dayjs'

import { RequestplusFinishedAnalysisPerson } from '~/models/dynamo/requestplus/finished-analysis-person/table'
import { UserplusCompany } from '~/models/dynamo/userplus/company'

const verifyValidityDate = (finished_person: RequestplusFinishedAnalysisPerson, company: UserplusCompany) => {
  const finished_at = dayjs(finished_person.finished_at).toDate()
  finished_at.setDate(finished_at.getDate() + company.analysis_config[finished_person.person_analysis_type.type])

  return dayjs(finished_at.toISOString()).format('DD/MM/YYYY')
}

export default verifyValidityDate

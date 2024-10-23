import { Timestamp } from '../../timestamp'

import { RequestplusCompanyConsultRequests } from './requests'

export type RequestplusCompanyConsultKey = {
  company_id: string
  year_month: string
}

export type RequestplusCompanyConsultBody = {
  company_name: string
  number_of_request: number
  requests: RequestplusCompanyConsultRequests[]
}

export type RequestplusCompanyConsult = RequestplusCompanyConsultKey & RequestplusCompanyConsultBody & Timestamp & {}

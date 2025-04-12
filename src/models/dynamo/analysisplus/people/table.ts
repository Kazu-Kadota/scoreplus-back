import { PersonRequestForms } from '../../requestplus/analysis-person/forms'
import { Timestamp } from '../../timestamp'

import { PeopleAnalysisCompanyOptions } from './company-options'
import { PeopleAnalysisValidatedOptions } from './validated-options'

export type AnalysisplusPeopleKey = {
  person_id: string
  document: string
}

// Validated need to be an array, to have a traceability
export type AnalysisplusPeopleBody = Omit<PersonRequestForms, 'document' | 'company_name'> & {
  companies: Partial<PeopleAnalysisCompanyOptions>
  validated: Partial<PeopleAnalysisValidatedOptions>
  black_list?: boolean
}

export type AnalysisplusPeople = AnalysisplusPeopleBody & AnalysisplusPeopleKey & Timestamp & {}

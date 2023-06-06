import { StateEnum } from './request-enum'
import { PersonRequestForms } from './request-person'

export interface CompaniesAnalysisContent {
  state?: StateEnum
  name: string[]
  updated_at: string
  request_id: string
}

export interface PersonValidatedContent {
  state?: StateEnum
  approved: boolean
  answer_description: string
  request_id: string
  updated_at: string
}

export interface PersonRegionType<T> {
  states?: T[]
  national?: T
}

export interface PersonAnalysisType<T> {
  simple?: PersonRegionType<T>
  history?: PersonRegionType<T>
}

export interface PersonKey {
  person_id: string
  document: string
}

export interface PersonBody extends Omit<PersonRequestForms, 'document'> {
  companies: PersonAnalysisType<CompaniesAnalysisContent>
  validated: PersonAnalysisType<PersonValidatedContent>
  black_list?: boolean
}

export interface Person extends PersonBody, PersonKey {
  updated_at: string
  created_at: string
}

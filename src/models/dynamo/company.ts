import { Timestamp } from './timestamp'

export enum CompanyPersonAnalysisConfigEnum {
  MEMBER = 'member',
  AGGREGATE = 'aggregate',
  AUTONOMOUS = 'autonomous',
  OPERATIONAL = 'operational',
  ADMINISTRATIVE = 'administrative',
}

export enum CompanyPersonAnalysisConfigNumberEnum {
  MEMBER = 182,
  AGGREGATE = 60,
  AUTONOMOUS = 1,
  OPERATIONAL = 365,
  ADMINISTRATIVE = 365,
}

export interface CompanyPersonAnalysisConfig {
  member: number
  aggregate: number
  autonomous: number
  operational: number
  administrative: number
}

export interface CompanySystemConfig {
  antt: boolean
  biometry: boolean
  serasa: boolean
}

export interface CompanyKey {
  company_id: string
}

export interface CompanyBody {
  cnpj: string
  name: string
  analysis_config: CompanyPersonAnalysisConfig
  system_config: CompanySystemConfig
}

export interface Company extends CompanyKey, CompanyBody, Timestamp {}

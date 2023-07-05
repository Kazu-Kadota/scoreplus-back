import { Timestamp } from './timestamp'

export enum CompanyPersonAnalysisConfigEnum {
  MEMBER = 'member',
  AGGREGATE = 'aggregate',
  AUTONOMOUS = 'autonomous',
  HR = 'hr',
}

export enum CompanyVehicleAnalysisConfigEnum {
  MEMBER = 'member',
  AGGREGATE = 'aggregate',
  AUTONOMOUS = 'autonomous',
}

export enum CompanyAnalysisConfigNumberEnum {
  MEMBER = 365,
  AGGREGATE = 182,
  AUTONOMOUS = 1,
  HR = 365,
}

export enum CompanySystemConfigEnum {
  ANTT = 'antt',
  BIOMETRY = 'biometry',
  SERASA = 'serasa',
}

export interface CompanyPersonAnalysisConfig extends Record<CompanyPersonAnalysisConfigEnum, number> {
}

export interface CompanySystemConfig extends Record<CompanySystemConfigEnum, boolean> {
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

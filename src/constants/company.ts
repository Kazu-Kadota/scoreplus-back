import { CompanyPersonAnalysisConfigEnum, CompanyRequestPersonConfigEnum, CompanyRequestVehicleConfigEnum } from '~/models/dynamo/enums/company'

export const companyAnalysisConfigStrings: Record<CompanyPersonAnalysisConfigEnum, string> = {
  [CompanyPersonAnalysisConfigEnum.MEMBER]: 'Frota',
  [CompanyPersonAnalysisConfigEnum.AGGREGATE]: 'Agregado',
  [CompanyPersonAnalysisConfigEnum.AUTONOMOUS]: 'Autônomo',
  [CompanyPersonAnalysisConfigEnum.HR]: 'Administrativo/Operacional',
}

export const companyRequestPersonConfigEnum: Record<CompanyRequestPersonConfigEnum, string> = {
  [CompanyRequestPersonConfigEnum.BIOMETRY]: 'Biometria',
  [CompanyRequestPersonConfigEnum.CNH_ADVANCED]: 'CNH avançado',
  [CompanyRequestPersonConfigEnum.CNH_MEDIUM]: 'CNH',
  [CompanyRequestPersonConfigEnum.CNH_SIMPLE]: 'CNH simples',
  [CompanyRequestPersonConfigEnum.ETHICAL]: 'Ético',
  [CompanyRequestPersonConfigEnum.HISTORY]: 'Histórico',
}

export const companyRequestVehicleConfigEnum: Record<CompanyRequestVehicleConfigEnum, string> = {
  [CompanyRequestVehicleConfigEnum.ANTT]: 'Antt',
  [CompanyRequestVehicleConfigEnum.ETHICAL]: 'Ético',
  [CompanyRequestVehicleConfigEnum.CRONOTACOGRAFO]: 'Cronotacografo',
  [CompanyRequestVehicleConfigEnum.PLATE_HISTORY]: 'Histórico de placa',
}

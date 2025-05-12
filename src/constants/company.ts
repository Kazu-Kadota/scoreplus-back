import { CompanyPersonAnalysisConfigEnum, CompanyRequestPersonConfigEnum, CompanyRequestVehicleConfigEnum } from '~/models/dynamo/enums/company'

export const companyAnalysisConfigStrings: Record<CompanyPersonAnalysisConfigEnum, string> = {
  [CompanyPersonAnalysisConfigEnum.MEMBER]: 'Frota',
  [CompanyPersonAnalysisConfigEnum.AGGREGATE]: 'Agregado',
  [CompanyPersonAnalysisConfigEnum.AUTONOMOUS]: 'Autônomo',
  [CompanyPersonAnalysisConfigEnum.HR]: 'Administrativo/Operacional',
}

export const companyRequestPersonConfigEnum: Record<CompanyRequestPersonConfigEnum, string> = {
  [CompanyRequestPersonConfigEnum.BASIC_DATA]: 'Dados básicos',
  [CompanyRequestPersonConfigEnum.BIOMETRY_BASIC]: 'Biometria básico',
  [CompanyRequestPersonConfigEnum.BIOMETRY_CNH]: 'Biometria cnh',
  [CompanyRequestPersonConfigEnum.BIOMETRY_FACIAL]: 'Biometria facial',
  [CompanyRequestPersonConfigEnum.CNH_ADVANCED]: 'CNH avançado',
  [CompanyRequestPersonConfigEnum.CNH_SIMPLE]: 'CNH simples',
  [CompanyRequestPersonConfigEnum.ETHICAL]: 'Ético',
  [CompanyRequestPersonConfigEnum.ETHICAL_COMPLETE]: 'Ético Completo',
  [CompanyRequestPersonConfigEnum.HISTORY]: 'Histórico',
  [CompanyRequestPersonConfigEnum.PROCESS]: 'Processo',
}

export const companyRequestVehicleConfigEnum: Record<CompanyRequestVehicleConfigEnum, string> = {
  [CompanyRequestVehicleConfigEnum.ANTT]: 'Antt',
  [CompanyRequestVehicleConfigEnum.BASIC_DATA]: 'Dados básicos',
  [CompanyRequestVehicleConfigEnum.CRONOTACOGRAFO]: 'Cronotacografo',
  [CompanyRequestVehicleConfigEnum.ETHICAL]: 'Ético',
  [CompanyRequestVehicleConfigEnum.PLATE_HISTORY]: 'Histórico de placa',
}

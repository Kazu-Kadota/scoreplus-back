import { CompanyPersonAnalysisConfigEnum } from 'src/models/dynamo/company'

export const companyPersonAnalysisConfigStrings: Record<CompanyPersonAnalysisConfigEnum, string> = {
  [CompanyPersonAnalysisConfigEnum.MEMBER]: 'Frota',
  [CompanyPersonAnalysisConfigEnum.AGGREGATE]: 'Agregado',
  [CompanyPersonAnalysisConfigEnum.AUTONOMOUS]: 'Autônomo',
  [CompanyPersonAnalysisConfigEnum.HR]: 'Administrativo/Operacional',
}

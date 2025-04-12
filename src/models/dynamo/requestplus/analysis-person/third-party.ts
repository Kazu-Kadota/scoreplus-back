import { CompanyRequestPersonConfigEnum } from '../../enums/company'
import { PersonStateEnum } from '../../enums/request'

export type PersonAnalysisThirdPartyHistoryRegion = Partial<{
  [Key in PersonStateEnum]: unknown
}>

export type PersonAnalysisThirdPartyHistory = {
  regions: Array<PersonAnalysisThirdPartyHistoryRegion>
}

export type PersonAnalysisThirdParty = Partial<{
  [Key in CompanyRequestPersonConfigEnum]: Key extends CompanyRequestPersonConfigEnum.HISTORY
    ? PersonAnalysisThirdPartyHistory
    : unknown
}>

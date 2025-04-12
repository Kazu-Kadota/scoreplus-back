import { CompanyRequestPersonConfigEnum } from '../../enums/company'
import { PersonStateEnum } from '../../enums/request'

export type PersonAnalysisOptionsRequestValueAnswer = {
  answered_at: string
  reason?: string
  type: CompanyRequestPersonConfigEnum
}

export type PersonAnalysisOptionsRequestValueHistoryRegion<Finished extends boolean> = Finished extends true
  ? PersonAnalysisOptionsRequestValueAnswer & { region: PersonStateEnum }
  : Partial<PersonAnalysisOptionsRequestValueAnswer> & { region: PersonStateEnum }

export type PersonAnalysisOptionsRequestValueHistory<Finished extends boolean> = {
  regions: Array<PersonAnalysisOptionsRequestValueHistoryRegion<Finished>>
}

export type PersonAnalysisOptionsRequestValueDefault<Finished extends boolean> = Finished extends true
  ? PersonAnalysisOptionsRequestValueAnswer
  : Partial<PersonAnalysisOptionsRequestValueAnswer>

export type PersonAnalysisOptionsRequest<Finished extends boolean> = {
  [Key in CompanyRequestPersonConfigEnum]: Key extends CompanyRequestPersonConfigEnum.HISTORY
    ? PersonAnalysisOptionsRequestValueHistory<Finished>
    : PersonAnalysisOptionsRequestValueDefault<Finished>
}

export type PersonAnalysisOptionsToRequest = Array<CompanyRequestPersonConfigEnum>

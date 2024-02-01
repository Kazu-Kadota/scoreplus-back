import { CompanyRequestPersonConfigEnum } from '../../enums/company'
import { AnalysisResultEnum, PersonStateEnum } from '../../enums/request'

export type PersonAnalysisOptionsRequestValueAnswer = {
  reason?: string
  result: AnalysisResultEnum
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

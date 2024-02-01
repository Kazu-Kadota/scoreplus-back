import { CompanyRequestPersonConfigEnum } from '../../enums/company'
import { AnalysisResultEnum, PersonStateEnum } from '../../enums/request'
import { Timestamp } from '../../timestamp'

export type PeopleAnalysisValidatedContent = Timestamp & {
  result: AnalysisResultEnum
  reason?: string
  request_id: string
}

export type PeopleAnalysisValidatedContentHistory = PeopleAnalysisValidatedContent & {
  state: PersonStateEnum
}

export type PeopleAnalysisValidatedOptions = {
  [Key in CompanyRequestPersonConfigEnum]: Key extends CompanyRequestPersonConfigEnum.HISTORY
    ? Array<PeopleAnalysisValidatedContentHistory>
    : PeopleAnalysisValidatedContent
}

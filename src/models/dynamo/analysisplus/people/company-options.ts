import { CompanyRequestPersonConfigEnum } from '../../enums/company'
import { PersonStateEnum } from '../../enums/request'
import { Timestamp } from '../../timestamp'

export type PeopleAnalysisCompanyContent = Timestamp & {
  company_names: string[]
  request_id: string
}

export type PeopleAnalysisCompanyContentHistory = PeopleAnalysisCompanyContent & {
  state: PersonStateEnum
}

export type PeopleAnalysisCompanyOptions = {
  [Key in CompanyRequestPersonConfigEnum]: Key extends CompanyRequestPersonConfigEnum.HISTORY
    ? Array<PeopleAnalysisCompanyContentHistory>
    : PeopleAnalysisCompanyContent
}

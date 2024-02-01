import { CompanyRequestPersonConfigEnum } from '../../enums/company'
import { GeneralAnalysisStatusEnum, PersonStateEnum, RequestStatusEnum } from '../../enums/request'

export type VerifyPersonAnalysisStatus<Finished extends boolean> = Finished extends true
  ? RequestStatusEnum.FINISHED
  : RequestStatusEnum

export type PersonAnalysisStatusHistoryRegion<Finished extends boolean> = Partial<{
  [Key in PersonStateEnum]: VerifyPersonAnalysisStatus<Finished>
}>

export type PersonAnalysisStatusHistory<Finished extends boolean> = {
  regions: Array<PersonAnalysisStatusHistoryRegion<Finished>>
}

export type PersonAnalysisStatus<Finished extends boolean> =
  Record<GeneralAnalysisStatusEnum, VerifyPersonAnalysisStatus<Finished>>
  & Partial<{
    [Key in CompanyRequestPersonConfigEnum]: Key extends CompanyRequestPersonConfigEnum.HISTORY
      ? PersonAnalysisStatusHistory<Finished>
      : VerifyPersonAnalysisStatus<Finished>
  }>

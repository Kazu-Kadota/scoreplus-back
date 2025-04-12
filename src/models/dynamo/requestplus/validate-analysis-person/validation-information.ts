import { CompanyRequestPersonConfigEnum } from '../../enums/company'
import { AnalysisResultEnum, PersonStateEnum } from '../../enums/request'

export type PersonAnalysisInformationValidationValueAnswer = {
  validated_at: string
  reason?: string
  result: AnalysisResultEnum
  type: CompanyRequestPersonConfigEnum
}

export type PersonAnalysisInformationValidationHistoryRegion<Validated extends boolean> = Validated extends true
  ? PersonAnalysisInformationValidationValueAnswer & { region: PersonStateEnum }
  : Partial<PersonAnalysisInformationValidationValueAnswer> & { region: PersonStateEnum }

export type PersonAnalysisInformationValidationHistory<Validated extends boolean> = {
  regions: Array<PersonAnalysisInformationValidationHistoryRegion<Validated>>
}

export type PersonAnalysisInformationValidationValueDefault<Finished extends boolean> = Finished extends true
  ? PersonAnalysisInformationValidationValueAnswer
  : Partial<PersonAnalysisInformationValidationValueAnswer>

export type PersonAnalysisInformationValidation<Validated extends boolean> =
  & Partial<{
  [Key in CompanyRequestPersonConfigEnum]: Key extends CompanyRequestPersonConfigEnum.HISTORY
    ? PersonAnalysisInformationValidationHistory<Validated>
    : PersonAnalysisInformationValidationValueDefault<Validated>
}>

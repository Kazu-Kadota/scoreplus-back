import { CompanyRequestVehicleConfigEnum } from '../../enums/company'
import { AnalysisResultEnum, VehicleAnalysisStateEnum } from '../../enums/request'

export type VehicleAnalysisInformationValidationValueAnswer = {
  validated_at: string
  reason?: string
  result: AnalysisResultEnum
  type: CompanyRequestVehicleConfigEnum
}

export type VehicleAnalysisInformationValidationHistoryRegion<Validated extends boolean> = Validated extends true
  ? VehicleAnalysisInformationValidationValueAnswer & { region: VehicleAnalysisStateEnum }
  : Partial<VehicleAnalysisInformationValidationValueAnswer> & { region: VehicleAnalysisStateEnum }

export type VehicleAnalysisInformationValidationHistory<Validated extends boolean> = {
  regions: Array<VehicleAnalysisInformationValidationHistoryRegion<Validated>>
}

export type VehicleAnalysisInformationValidationValueDefault<Finished extends boolean> = Finished extends true
  ? VehicleAnalysisInformationValidationValueAnswer
  : Partial<VehicleAnalysisInformationValidationValueAnswer>

export type VehicleAnalysisInformationValidation<Validated extends boolean> = Partial<{
  [Key in CompanyRequestVehicleConfigEnum]: Key extends CompanyRequestVehicleConfigEnum.PLATE_HISTORY
    ? VehicleAnalysisInformationValidationHistory<Validated>
    : VehicleAnalysisInformationValidationValueDefault<Validated>
}>

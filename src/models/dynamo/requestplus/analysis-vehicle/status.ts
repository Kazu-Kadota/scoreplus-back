import { CompanyRequestVehicleConfigEnum } from '../../enums/company'
import { GeneralAnalysisStatusEnum, RequestStatusEnum } from '../../enums/request'

export type VerifyVehicleAnalysisStatus<Finished extends boolean> = Finished extends true
  ? RequestStatusEnum.FINISHED
  : RequestStatusEnum

export type VehicleAnalysisStatus<Finished extends boolean> =
  Record<GeneralAnalysisStatusEnum, VerifyVehicleAnalysisStatus<Finished>>
  & Partial<{
    [Key in CompanyRequestVehicleConfigEnum]: VerifyVehicleAnalysisStatus<Finished>
  }>

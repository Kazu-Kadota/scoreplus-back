import { CompanyRequestVehicleConfigEnum } from '../../enums/company'
import { GeneralAnalysisStatusEnum, RequestStatusEnum, VehicleAnalysisStateEnum } from '../../enums/request'

export type VerifyVehicleAnalysisStatus<Finished extends boolean> = Finished extends true
  ? RequestStatusEnum.FINISHED
  : RequestStatusEnum

export type VehicleAnalysisStatusHistoryRegion<Finished extends boolean> = Partial<{
    [Key in VehicleAnalysisStateEnum]: VerifyVehicleAnalysisStatus<Finished>
  }>

export type VehicleAnalysisStatusHistory<Finished extends boolean> = {
    regions: Array<VehicleAnalysisStatusHistoryRegion<Finished>>
  }

export type VehicleAnalysisStatus<Finished extends boolean> =
  Record<GeneralAnalysisStatusEnum, VerifyVehicleAnalysisStatus<Finished>>
  & Partial<{
    [Key in CompanyRequestVehicleConfigEnum]: Key extends CompanyRequestVehicleConfigEnum.PLATE_HISTORY
      ? VehicleAnalysisStatusHistory<Finished>
      : VerifyVehicleAnalysisStatus<Finished>
  }>

import { CompanyRequestPersonBiometryConfigEnum } from '../dynamo/enums/company'

export type DatavalidImageObjectBasic = {}

export type DatavalidImageObjectFacial = {
  s3_facial_image_path: string
}

export type DatavalidImageObjectCNH = {
  s3_document_image_path: string
  s3_document_back_image_path?: string
  s3_facial_image_path?: string
}

export type DatavalidImageObjectType<T> = {
  type: T
}

export type DatavalidImageObject<T = unknown> = T extends CompanyRequestPersonBiometryConfigEnum.BIOMETRY_BASIC
  ? DatavalidImageObjectBasic & DatavalidImageObjectType<T>
  : T extends CompanyRequestPersonBiometryConfigEnum.BIOMETRY_FACIAL
    ? DatavalidImageObjectFacial & DatavalidImageObjectType<T>
    : T extends CompanyRequestPersonBiometryConfigEnum.BIOMETRY_CNH
      ? DatavalidImageObjectCNH & DatavalidImageObjectType<T>
      : unknown

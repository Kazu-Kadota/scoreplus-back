export enum DatavalidS3MetadataTypeEnum {
  BASIC = 'basic',
  FACIAL = 'facial',
  CNH = 'cnh',
}

export type DatavalidS3Metadata = {
  type: DatavalidS3MetadataTypeEnum
}

export enum CompanyAnalysisConfigNumberEnum {
  MEMBER = 365,
  AGGREGATE = 182,
  AUTONOMOUS = 1,
  HR = 365,
}

export enum CompanyPersonAnalysisConfigEnum {
  MEMBER = 'member',
  AGGREGATE = 'aggregate',
  AUTONOMOUS = 'autonomous',
  HR = 'hr',
}

export enum CompanyVehicleAnalysisConfigEnum {
  MEMBER = 'member',
  AGGREGATE = 'aggregate',
  AUTONOMOUS = 'autonomous',
}

export enum CompanyRequestPersonBiometryConfigEnum {
  BIOMETRY_FACIAL = 'biometry-facial',
  BIOMETRY_BASIC = 'biometry-basic',
  BIOMETRY_CNH = 'biometry-cnh',
}

export enum CompanyRequestPersonConfigEnum {
  BASIC_DATA = 'basic-data',
  BIOMETRY_BASIC = 'biometry-basic',
  BIOMETRY_CNH = 'biometry-cnh',
  BIOMETRY_FACIAL = 'biometry-facial',
  CNH_ADVANCED = 'cnh-advanced',
  CNH_SIMPLE = 'cnh-simple',
  ETHICAL = 'ethical',
  HISTORY = 'history',
  PROCESS = 'process',
}

export const CompanyRequestPersonConfigDefaultArray: Array<Omit<CompanyRequestPersonConfigEnum,
  CompanyRequestPersonConfigEnum.BIOMETRY_BASIC
  | CompanyRequestPersonConfigEnum.BIOMETRY_CNH
  | CompanyRequestPersonConfigEnum.BIOMETRY_FACIAL
>> = [
  CompanyRequestPersonConfigEnum.BASIC_DATA,
  CompanyRequestPersonConfigEnum.CNH_ADVANCED,
  CompanyRequestPersonConfigEnum.CNH_SIMPLE,
  CompanyRequestPersonConfigEnum.ETHICAL,
  CompanyRequestPersonConfigEnum.HISTORY,
  CompanyRequestPersonConfigEnum.PROCESS,
]

export enum CompanyRequestVehicleConfigEnum {
  ANTT = 'antt',
  BASIC_DATA = 'basic-data',
  CRONOTACOGRAFO = 'cronotacografo',
  ETHICAL = 'ethical',
  PLATE_HISTORY = 'plate-history'
}

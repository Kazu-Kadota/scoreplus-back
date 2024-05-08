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

export enum CompanyRequestPersonBiometryConfigEnum {
  BIOMETRY_FACIAL = 'biometry-facial',
  BIOMETRY_BASIC = 'biometry-basic',
  BIOMETRY_CNH = 'biometry-cnh',
}

export enum CompanyRequestPersonConfigEnum {
  BIOMETRY_FACIAL = 'biometry-facial',
  BIOMETRY_BASIC = 'biometry-basic',
  BIOMETRY_CNH = 'biometry-cnh',
  CNH_SIMPLE = 'cnh-simple',
  CNH_MEDIUM = 'cnh-medium',
  CNH_ADVANCED = 'cnh-advanced',
  ETHICAL = 'ethical',
  HISTORY = 'history',
}

export enum CompanyVehicleAnalysisConfigEnum {
  MEMBER = 'member',
  AGGREGATE = 'aggregate',
  AUTONOMOUS = 'autonomous',
}

export enum CompanyRequestVehicleConfigEnum {
  ETHICAL = 'ethical',
  ANTT = 'antt',
  CRONOTACOGRAFO = 'cronotacografo',
  PLATE_HISTORY = 'plate-history'
}

export enum EagleSystemDriverCategoryEnum {
  A = 'A',
  B = 'B',
  AB = 'AB',
  C = 'C',
  D = 'D',
  E = 'E'
}

export enum EagleSystemStateEnum {
  AC = 'AC',
  AL = 'AL',
  AP = 'AP',
  AM = 'AM',
  BA = 'BA',
  CE = 'CE',
  DF = 'DF',
  ES = 'ES',
  GO = 'GO',
  MA = 'MA',
  MT = 'MT',
  MS = 'MS',
  MG = 'MG',
  PA = 'PA',
  PB = 'PB',
  PR = 'PR',
  PE = 'PE',
  PI = 'PI',
  RJ = 'RJ',
  RN = 'RN',
  RS = 'RS',
  RO = 'RO',
  RR = 'RR',
  SC = 'SC',
  SP = 'SP',
  SE = 'SE',
  TO = 'TO',
}

export enum EagleSystemPlateStateEnum {
  AC = 'AC',
  AL = 'AL',
  AP = 'AP',
  AM = 'AM',
  BA = 'BA',
  CE = 'CE',
  DF = 'DF',
  ES = 'ES',
  GO = 'GO',
  MA = 'MA',
  MT = 'MT',
  MS = 'MS',
  MG = 'MG',
  PA = 'PA',
  PB = 'PB',
  PR = 'PR',
  PE = 'PE',
  PI = 'PI',
  RJ = 'RJ',
  RN = 'RN',
  RS = 'RS',
  RO = 'RO',
  RR = 'RR',
  SC = 'SC',
  SP = 'SP',
  SE = 'SE',
  TO = 'TO',
  MERCOSUL = 'MERCOSUL',
}

export enum EagleSystemRequestStatusEnum {
  WAITING = 'WAITING',
  PROCESSING = 'PROCESSING',
  FINISHED = 'FINISHED'
}

export enum EagleSystemAnalysisTypeEnum {
  COMBO = 'combo',
  PERSON = 'person',
  VEHICLE = 'vehicle',
}

export enum EagleSystemPersonRegionTypeEnum {
  STATES = 'states',
  NATIONAL = 'national',
  NATIONAL_DB = 'national + db',
  NATIONAL_STATE = 'national + state',
}

export enum EagleSystemPersonAnalysisTypeEnum {
  BASIC_DATA = 'basic-data',
  CNH_BASIC = 'cnh-basic',
  CNH_STATUS = 'cnh-status',
  HISTORY = 'history',
  PROCESS = 'process',
  SIMPLE = 'simple',
}

export const is_person_analysis_type_automatic_arr: Array<Omit<EagleSystemPersonAnalysisTypeEnum, EagleSystemPersonAnalysisTypeEnum.SIMPLE | EagleSystemPersonAnalysisTypeEnum.HISTORY>> = [
  EagleSystemPersonAnalysisTypeEnum.BASIC_DATA,
  EagleSystemPersonAnalysisTypeEnum.CNH_BASIC,
  EagleSystemPersonAnalysisTypeEnum.CNH_STATUS,
  EagleSystemPersonAnalysisTypeEnum.PROCESS,
]

export enum EagleSystemVehicleAnalysisTypeEnum {
  SIMPLE = 'simple',
  BASIC_DATA = 'basic-data',
  ANTT = 'antt',
  VEHICLE_PLATE_HISTORY = 'vehicle-plate-history',
  VEHICLE_SECOND_DRIVER = 'vehicle-second-driver'
}

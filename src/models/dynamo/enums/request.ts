export enum RequestStatusEnum {
  CANCELED = 'CANCELED',
  FINISHED = 'FINISHED',
  PROCESSING = 'PROCESSING',
  WAITING = 'WAITING',
}

export enum AnalysisResultEnum {
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export enum GeneralAnalysisStatusEnum {
  GENERAL = 'general'
}

export enum AnalysisTypeEnum {
  COMBO = 'combo',
  PERSON = 'person',
  VEHICLE = 'vehicle',
}

export enum PersonRegionTypeEnum {
  STATES = 'states',
  NATIONAL = 'national'
}

export enum DriverCategoryEnum {
  A = 'A',
  B = 'B',
  AB = 'AB',
  C = 'C',
  D = 'D',
  E = 'E'
}

export enum StateEnum {
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

// Como o nacional histórico será a pesquisa ética, não precisa ter o Brasil como valor e pode ser juntado em uma única Enum
export enum PersonStateEnum {
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
  BRASIL = 'BRASIL',
}

export enum PlateStateEnum {
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

export enum VehicleType {
  CARRETA = 'CARRETA',
  CAVALO = 'CAVALO'
}

import { ImageAnswer } from '../image-answer'
import { PFBasicAnswer } from '../pf-basic/request-body'
import { DatavalidRequestImage } from '../request-image'

export type PFFacialKey = {
  cpf: string
}

export type PFFacialSendRequestAnswer = Partial<PFBasicAnswer> & {
  biometria_face: DatavalidRequestImage
}

export type PFFacialBiometrySendRequestBody = {
  key: PFFacialKey
  answer: PFFacialSendRequestAnswer
}

export type PFFacialAnswer = Partial<PFBasicAnswer> & {
  biometria_face: ImageAnswer
}

export type PFFacialBiometryBody = {
  key: PFFacialKey
  answer: PFFacialAnswer
}

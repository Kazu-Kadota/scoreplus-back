import { ImageAnswer } from '../image-answer'
import { DatavalidRequestImage } from '../request-image'

export enum PFFacialCDVImagesAnswerEnum {
  DOCUMENT = 'document',
  DOCUMENT_BACK = 'document_back', // Is needed to be underscore because this enum access property of object
  FACIAL = 'facial',
}

export type PFFacialCDVKey = {
  cpf: string
}

export type PFFacialCDVSendRequestAnswer = {
  documento: DatavalidRequestImage
  documento_verso?: Partial<DatavalidRequestImage>
  biometria_face?: Partial<DatavalidRequestImage>
}

export type PFFacialCDVBiometrySendRequestBody = {
  key: PFFacialCDVKey
  answer: PFFacialCDVSendRequestAnswer
}

export type PFFacialCDVAnswer = {
  documento: ImageAnswer
  documento_verso?: Partial<ImageAnswer>
  biometria_face?: Partial<ImageAnswer>
}

export type PFFacialCDVBiometryBody = {
  key: PFFacialCDVKey
  answer: PFFacialCDVAnswer
}

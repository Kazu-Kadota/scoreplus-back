import { FaceResult } from '../face-result'
import { PFBasicResult } from '../pf-basic/result'

export type PFFacialResult = PFBasicResult & {
  biometria_face: Partial<FaceResult>;
}

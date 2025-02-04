import { auth } from '@/lib/firebase';
import {
  browserSessionPersistence,
  GoogleAuthProvider,
  setPersistence,
  signInWithPopup
} from '@firebase/auth';

export const googleApis = {
  async sign() {
    const provider = new GoogleAuthProvider();

    //Note. 인증 상태 지속성
    await setPersistence(auth, browserSessionPersistence);

    return signInWithPopup(auth, provider)
      .then((res) => {
        return res;
      })
      .catch((e) => {
        const code = e.code;
        console.error('SignInWithGoogle Error : ', code, e, e.customData.email);
        throw e;
      });
  }
}

export default googleApis;
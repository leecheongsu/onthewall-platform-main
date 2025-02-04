import axios from 'axios';

export const kakaoApis = {
  authorized(route: string) {
    return Kakao.Auth.authorize({
      // redirectUri: `http://localhost:3000${route}`
      redirectUri: `https://www.onthewall.io${route}`
    });
  },
  async getUserData(code: string, route: string) {
    if (!Kakao.isInitialized()) {
      console.log('Kakao SDK is not initialized. Initializing now...');
      Kakao.init('000449cced76c5fafdf4c8b065679d0b');
    }


    const response = await axios.post('https://kauth.kakao.com/oauth/token',
      {},
      {
        params: {
          grant_type: 'authorization_code',
          client_id: '000449cced76c5fafdf4c8b065679d0b',
          // redirectUri: `http://localhost:3000${route}`,
          redirectUri: `https://www.onthewall.io${route}`,
          code: code
        }
      }
    );

    if (response.status === 200) {
      Kakao.Auth.setAccessToken(response.data.access_token);

      try {
        return await Kakao.API.request({
          url: '/v2/user/me'
        });
      } catch (e) {
        console.error('Kakao API Data Error:', e);
        throw e;
      }
    } else {
      throw { code: '', message: ' ' };
    }
  },
  signOut() {
    // return Kakao.Auth.logout()
  }
};

export default kakaoApis;
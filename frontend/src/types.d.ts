// Global type declarations for external SDKs

interface FacebookAuthResponse {
  accessToken: string;
  expiresIn: number;
  signedRequest: string;
  userID: string;
}

interface FacebookLoginStatusResponse {
  status: 'connected' | 'not_authorized' | 'unknown';
  authResponse?: FacebookAuthResponse;
}

interface FacebookSDK {
  init(params: {
    appId: string | undefined;
    cookie: boolean;
    xfbml: boolean;
    version: string;
  }): void;
  login(
    callback: (response: FacebookLoginStatusResponse) => void,
    options?: { scope?: string }
  ): void;
}

interface Window {
  FB?: FacebookSDK;
}

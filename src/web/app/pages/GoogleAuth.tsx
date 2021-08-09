import socialAuth from 'helpers/social-auth';
import { signInWithGoogleCode } from 'helpers/api/flux-id';

function GoogleAuth(): JSX.Element {
  const [_, ...params] = window.location.hash.split('?');
  const [codeParam, redirectdUrlParam] = params.join('?').split('&');
  signInWithGoogleCode({
    code: codeParam.split('=')[1],
    redirect_url: [redirectdUrlParam.split('=')[1], redirectdUrlParam.split('=')[2]].join('='),
  }).then(socialAuth);
  return null;
}

export default GoogleAuth;

const URL_BASE = '/api';
const URL_LOGIN = URL_BASE + '/login';
const URL_REGISTER = URL_BASE + '/register';

const Method = {
  GET: 'GET',
  POST: 'POST',
};

class ApiUtils {
  async login(loginInfo) {
    return await send(Method.POST, URL_LOGIN, loginInfo);
  }

  async register(registerInfo) {
    return await send(Method.POST, URL_REGISTER, registerInfo);
  }
}

async function send(method, url, params) {
  if(typeof params !== 'object') {
    throw Error('params must be an object');
  }
  let body = JSON.stringify(params);
  return await fetch(url, {
    method: method,
    body: body,
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
  }).then(resp => resp.json());
}

export default new ApiUtils();

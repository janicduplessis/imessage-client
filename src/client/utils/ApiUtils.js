const URL_BASE = '/api';
const URL_LOGIN = URL_BASE + '/login';

const Method = {
  GET: 'get',
  POST: 'post',
};

class ApiUtils {
  async login(loginInfo) {
    return await send(Method.POST, URL_LOGIN, loginInfo);
  }

  async register() {

  }
}

async function send(method, url, params) {
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

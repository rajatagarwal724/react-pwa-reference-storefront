/**
 * Copyright © 2018 Elastic Path Software Inc. All rights reserved.
 *
 * This is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This software is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this license. If not, see
 *
 *     https://www.gnu.org/licenses/
 *
 *
 */

import { cortexFetch, cortexFetchAsync } from './Cortex';

const Config = require('Config');

let userFormBody = [];
let userFormBodyString = '';

function generateFormBody(userDetails) {
  Object.keys(userDetails).forEach((encodedKey) => {
    const encodedValue = userDetails[encodedKey];
    userFormBody.push(`${encodedKey}=${encodedValue}`);
  });
  userFormBodyString = userFormBody.join('&');
}

export function login() {
  return new Promise(((resolve, reject) => {
    if (localStorage.getItem(`${Config.cortexApi.scope}_oAuthToken`) === null) {
      userFormBodyString = '';
      userFormBody = [];
      const publicUserDetails = {
        username: '',
        password: '',
        grant_type: 'password',
        role: 'PUBLIC',
        scope: Config.cortexApi.scope,
      };
      generateFormBody(publicUserDetails);

      cortexFetch('/oauth2/tokens', {
        method: 'post',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
        },
        body: userFormBodyString,
      }).then(res => res.json())
        .then((res) => {
          localStorage.setItem(`${Config.cortexApi.scope}_oAuthRole`, res.role);
          localStorage.setItem(`${Config.cortexApi.scope}_oAuthScope`, res.scope);
          localStorage.setItem(`${Config.cortexApi.scope}_oAuthToken`, `Bearer ${res.access_token}`);
          localStorage.setItem(`${Config.cortexApi.scope}_oAuthUserName`, publicUserDetails.username);
          resolve(res);
        })
        .catch((error) => {
          // eslint-disable-next-line no-console
          console.error(error.message);
          reject(error);
        });
    } else {
      resolve(userFormBodyString);
    }
  }));
}

export async function loginRegistered(username, password) {
  const res = await cortexFetchAsync('/oauth2/tokens', {
    method: 'post',
    urlEncoded: true,
    body: {
      username,
      password,
      grant_type: 'password',
      role: 'REGISTERED',
      scope: Config.cortexApi.scope,
    },
  });

  localStorage.setItem(`${Config.cortexApi.scope}_oAuthRole`, res.parsedJson.role);
  localStorage.setItem(`${Config.cortexApi.scope}_oAuthScope`, res.parsedJson.scope);
  localStorage.setItem(`${Config.cortexApi.scope}_oAuthToken`, `Bearer ${res.parsedJson.access_token}`);
  localStorage.setItem(`${Config.cortexApi.scope}_oAuthUserName`, username);

  return res;
}

export async function logout() {
  await cortexFetchAsync('/oauth2/tokens', {
    method: 'delete',
    ignoreErrors: true,
    parseJson: false,
  });

  localStorage.removeItem(`${Config.cortexApi.scope}_oAuthRole`);
  localStorage.removeItem(`${Config.cortexApi.scope}_oAuthScope`);
  localStorage.removeItem(`${Config.cortexApi.scope}_oAuthToken`);
  localStorage.removeItem(`${Config.cortexApi.scope}_oAuthUserName`);
}

export async function registerUser(lastname, firstname, username, password) {
  const regFormRes = await cortexFetchAsync('/?zoom=newaccountform', {});
  const regLink = regFormRes.parsedJson.links.find(link => link.rel === 'newaccountform').uri;

  await cortexFetchAsync(regLink, {
    method: 'post',
    body: {
      'family-name': lastname,
      'given-name': firstname,
      username,
      password,
    },
  });

  await loginRegistered(username, password);
}

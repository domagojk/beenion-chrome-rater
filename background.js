// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
const clientId = '3b0nk6g7u5udpq64r35vvujtm7'
;('use strict')
chrome.runtime.onMessageExternal.addListener(function(
  request,
  sender,
  sendResponse
) {
  if (sender.url.startsWith('https://beenion.com/logout')) {
    return null
  }
  if (!sender.url.startsWith('https://beenion.com')) {
    return null
  }
  if (request.type === 'logout') {
    chrome.storage.local.remove('authData')
  } else if (request.type === 'lastLink') {
    chrome.storage.local.set({
      lastSeenLink: {
        url: request.url,
        username: request.username
      },
      unseen: null
    })
    chrome.browserAction.setBadgeText({ text: '' })
  } else if (request.accessToken) {
    chrome.storage.local.get(['authData'], function(result) {
      if (
        !result.authData ||
        result.authData.refreshToken !== request.refreshToken.token
      ) {
        chrome.storage.local.set(
          {
            authData: {
              accessToken: request.accessToken.jwtToken,
              expires: request.accessToken.payload.exp * 1000,
              refreshToken: request.refreshToken.token,
              username: request.idToken.payload['cognito:username'],
              name: request.idToken.payload.name
            }
          },
          () => {
            chrome.notifications.create({
              type: 'basic',
              iconUrl: 'icons/icon128.png',
              title: 'Login Successful',
              message: 'You can start rating pages'
            })
          }
        )
      }
    })
  }
})

const ratings$ = new rxjs.Subject()

ratings$
  .pipe(rxjs.operators.debounce(() => rxjs.timer(1000)))
  .pipe(
    rxjs.operators.switchMap(({ payload, type, accessToken }) => {
      return fetch('https://api.beenion.com/v1/linkCommand', {
        method: 'post',
        headers: new Headers({
          Authorization: 'Bearer ' + accessToken,
          Accept: 'application/json',
          'Content-Type': 'application/json'
        }),
        body: JSON.stringify({
          type,
          payload
        })
      })
    })
  )
  .pipe(
    rxjs.operators.map(data => {
      console.log(data)
    })
  )
  .subscribe()

chrome.storage.onChanged.addListener(function(changes, namespace) {
  chrome.storage.local.get(['authData'], storage => {
    for (const key in changes) {
      var storageChange = changes[key]
      if (
        key === 'unseen' ||
        !storageChange.newValue ||
        !storageChange.newValue.url ||
        !storageChange.newValue.rating
      ) {
        continue
      }
      if (storage.authData.username !== storageChange.newValue.username) {
        continue
      }
      ratings$.next({
        type: 'rate',
        payload: {
          linkUrl: storageChange.newValue.url,
          title: storageChange.newValue.title,
          image: storageChange.newValue.image,
          rating: storageChange.newValue.rating,
          tags: storageChange.newValue.tags
        },
        accessToken: storage.authData.accessToken
      })
    }
  })
})

function getBearerToken(authData) {
  if (authData.expires < Date.now()) {
    return fetch('https://cognito-idp.us-east-1.amazonaws.com', {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/x-amz-json-1.1',
        'X-Amz-Target': 'AWSCognitoIdentityProviderService.InitiateAuth'
      },
      body: JSON.stringify({
        ClientId: clientId,
        AuthFlow: 'REFRESH_TOKEN_AUTH',
        AuthParameters: {
          REFRESH_TOKEN: authData.refreshToken
        }
      })
    })
      .then(response => response.json())
      .then(res => {
        const newTokenData = {
          accessToken: res.AuthenticationResult.AccessToken,
          expires: Date.now() + res.AuthenticationResult.ExpiresIn * 1000,
          refreshToken: authData.refreshToken,
          username: authData.username,
          name: authData.name
        }
        return new Promise(resolve =>
          chrome.storage.local.set({ authData: newTokenData }, () => {
            resolve(newTokenData.accessToken)
          })
        )
      })
  } else {
    return Promise.resolve(authData.accessToken)
  }
}

function checklast() {
  chrome.storage.local.get(['authData', 'lastSeenLink'], storage => {
    if (!storage.authData) {
      return
    }
    getBearerToken(storage.authData)
      .then(token =>
        fetch('https://api.beenion.com/v1/checklast', {
          method: 'get',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
        })
      )
      .then(response => response.json())
      .then(res => {
        if (
          res &&
          res.links &&
          storage.authData.username !== storage.lastSeenLink.username &&
          res.links[0].url !== storage.lastSeenLink.url
        ) {
          chrome.browserAction.setBadgeText({ text: '1' })
          chrome.storage.local.set({
            unseen: res.links[0]
          })
        } else {
          chrome.browserAction.setBadgeText({ text: '' })
        }
      })
  })
}
checklast()
setInterval(checklast, 60000 * 5)

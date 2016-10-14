import Vue from 'vue'
import decode from 'jwt-decode'

const TOKEN_KEY = '_token'

export function getToken() {
  if (Vue.http.headers.common['Authorization'])
    return Vue.http.headers.common['Authorization'].substr('Bearer '.length)
  if (window.sessionStorage)
    return window.sessionStorage.getItem(TOKEN_KEY)
  if (window.localStorage)
    return window.localStorage.getItem(TOKEN_KEY)
}

export function isTokenStored() {
  // check if user want to store token
  return window.localStorage && window.localStorage.getItem(TOKEN_KEY)
}

export function setToken(token, remember = false) {
  if (!token)
    return clearToken()
  Vue.http.headers.common['Authorization'] = 'Bearer '+token
  if (window.sessionStorage)
    window.sessionStorage.setItem(TOKEN_KEY, token)
  if (remember && window.localStorage)
    window.localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken() {
  delete Vue.http.headers.common['Authorization']
  if (window.sessionStorage)
    window.sessionStorage.removeItem(TOKEN_KEY)
  if (window.localStorage)
    window.localStorage.removeItem(TOKEN_KEY)
}

export function decodeToken(token) {
    return decode(token)
}
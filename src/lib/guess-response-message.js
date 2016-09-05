'use strict'

export default function GuessResponseMessage(res) {
  try {
    return res.json().message
  }catch(e) {
    return res.text()
  }
}
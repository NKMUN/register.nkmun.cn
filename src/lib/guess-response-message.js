'use strict'

export default function GuessResponseMessage(res) {
  if (res instanceof Error) {
    return `Error: ${res.message}`
  }else{
    try {
      return res.json().message
    }catch(e) {
      return res.text()
    }
  }
}
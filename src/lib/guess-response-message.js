'use strict'

export default function GuessResponseMessage(res) {
  if (res instanceof Error) {
    return `Error: ${res.message}`
  }else{
      return res.json().then( ({message}) => message )
             .catch( e => res.text() )
  }
}
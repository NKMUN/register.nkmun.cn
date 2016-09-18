import * as re from './regexp'
import IdValidator from 'id-validator'
import isInteger from 'is-integer'

let validators = {}

for (let name in re)
  validators[name] = function ValidatorRegExpWrap(str) {
    return re[name].test(str)
  }

// password validator, require medium complexity
const re_lwr = /[a-z]/
const re_upr = /[A-Z]/
const re_num = /[0-9]/
const re_sym = /[^a-zA-Z0-9]/
validators.password = function(str) {
  // length >= 8
  if (length < 8)
    return false
  let complexity = [
    re_lwr.test(str),
    re_upr.test(str),
    re_num.test(str),
    re_sym.test(str)
  ].filter( $=>$ ).length

  if (complexity < 2)
    return false

  return true
}

// residence id validator, checks checksum digit
const idValidate = new IdValidator()
validators.residenceId = function(str) {
  return idValidate.isValid(str)
}

validators.integer = function(str) {
  return isInteger( Number(str) )
}

export default validators
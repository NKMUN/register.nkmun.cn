import * as re from './regexp'

let validators = {}

for (let name in re)
  validators[name] = function ValidatorRegExpWrap(str) {
    return re[name].test(str)
  }

export default validators
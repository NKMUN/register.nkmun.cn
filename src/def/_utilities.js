
const FT = (name, dbId, placeholder='', validate=[]) => ({tag: 'input', name, dbId, validate, placeholder})
const FN = (name, dbId, placeholder='', validate=[]) => ({tag: 'input', type: 'number', name, dbId, validate, placeholder})
const FR = (name, dbId, opts, validate=[]) => ({tag: 'radio', name, dbId, validate, opts})
const O  = (text, val) => ({text, val})
const TA = (name, dbId, placeholder='', validate=[]) => ({name, tag: 'textarea', dbId, validate, placeholder})
const H  = (html) => ({tag: 'html', html})
const P  = (text, className) => ({tag: 'p', text, className})

export {FT, FN, FR, O, TA, H, P}
export function extractCollectedField(_section) {
  // shallow copy section definition
  let section = Object.assign({}, _section)
  section.fields = section.fields.filter( ({tag}) => tag!=='p' && tag!=='html')
  return section
}
export function mergeArray(l, r) {
  return [...l, ...r]
}

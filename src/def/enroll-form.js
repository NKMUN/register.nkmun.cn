const FT = (name, dbId, placeholder='', validate=[]) => ({tag: 'input', name, dbId, validate, placeholder})
const FN = (name, dbId, placeholder='', validate=[]) => ({tag: 'input', type: 'number', name, dbId, validate, placeholder})
const FR = (name, dbId, opts, validate=[]) => ({tag: 'radio', name, dbId, validate, opts})
const O  = (text, val) => ({text, val})
const TA = (name, dbId, placeholder='', validate=[]) => ({name, tag: 'textarea', dbId, validate, placeholder})
const H  = (html) => ({tag: 'html', html})
const P  = (text, className) => ({tag: 'p', text, className}) 

import TESTS from './ac-test'

const TEST_FORM = TESTS.map( ({name, text, dbId}) => [
   P(text, 'question'),
  TA(name, dbId, '', ['required'])
])
.reduce( (l,r) => [...l, ...r] )

function extractCollectedField(_section) {
  // shallow copy section definition
  let section = Object.assign({}, _section)
  section.fields = section.fields.filter( ({tag}) => tag!=='p' && tag!=='html')
  return section
}

/*
 * Define form sections below 
 */

const GENDER_OPTS = [O('男', 'm'), O('女', 'f')]

const SECTION_SCHOOL = {
  section: '学校',
  class:   'school',
  fields:  [
    FT('中文名称', 'school',    '请输入学校中文全称',   ['required']),
    FT('英文名称', 'school_en', '请输入学校英文全称',   ['required', 'enName'])
  ]
}

const SECTION_CONTACT = {
  section: '领队信息',
  class:   'contact',
  fields:  [
    FT('姓名',    'name',   '请输入领队姓名',   ['required']),
    FR('性别',    'gender', GENDER_OPTS,      ['required']),
    FT('手机号码', 'phone', '请输入领队手机号码', ['required', 'phone']),
    FT('邮箱地址', 'email', '请输入领队邮箱地址', ['required', 'email']),
  ]
}

const SECTION_QUOTE = {
  section: '名额申请',
  class:   'quote',
  fields:  [
    FN('中文会场',    'quote_cn',        0, ['required']),
    FN('英文会场',    'quote_en',        0, ['required']),
    FN('联动体系',    'quote_linkage',   0, ['required']),
    FN('媒体团队',    'quote_press',     0, ['required']),
  ]
}

const SECTION_ACTEST = {
  section: '学术水平测试',
  class:   'ac-test',
  fields:  [ ...TEST_FORM ]
}

// form for enroll
export default [
  SECTION_SCHOOL,
  SECTION_CONTACT,
  SECTION_QUOTE,
  SECTION_ACTEST
]

// form for enroll review
export const review = [
  SECTION_SCHOOL,
  SECTION_ACTEST,
  SECTION_QUOTE
].map( extractCollectedField )
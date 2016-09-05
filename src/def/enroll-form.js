const FT = (name, dbId, placeholder='', validate=[]) => ({tag: 'input', name, dbId, validate, placeholder})
const FN = (name, dbId, placeholder='', validate=[]) => ({tag: 'input', type: 'number', name, dbId, validate, placeholder})
const FR = (name, dbId, opts, validate=[]) => ({tag: 'radio', name, dbId, validate, opts})
const O  = (text, val) => ({text, val})
const TA = (name, dbId, placeholder='', validate=[]) => ({name, tag: 'textarea', dbId, validate, placeholder})
const H  = (html) => ({tag: 'html', html})
const P  = (text, className) => ({tag: 'p', text, className}) 

const GENDER_OPTS = [O('男', 'm'), O('女', 'f'), O('未知', 'u')]

import TESTS from './ac-test'

const TEST_FORM = TESTS.map( ({name, text, dbId}) => [
   P(text, 'question'),
  TA(name, dbId, '', ['required'])
])
.reduce( (l,r) => [...l, ...r] )

export default [
    {
      section: '学校',
      class:   'school',
      fields:  [
        FT('中文名称', 'school',    '澄空学园',   ['required']),
        FT('英文名称', 'school_en', 'Sumi Sora', ['required', 'enName'])
      ]
    }, 
    {
      section: '联系人',
      class:   'contact',
      fields:  [
        FT('姓名',    'name',   '黑黑黑',              ['required']),
        FR('性别',    'gender', GENDER_OPTS,          ['required']),
        FT('手机号码', 'phone', '13800000000',         ['required', 'phone']),
        FT('邮件地址', 'email', 'someone@example.com', ['required', 'email']),
      ]
    },
    {
      section: '名额',
      class:   'quote',
      fields:  [
        FN('中文', 'quote_cn',    0, ['required']),
        FN('英文', 'quote_en',    0, ['required']),
        FN('媒体', 'quote_press', 0, ['required']),
      ]
    },
    {
      section: '学术水平测试',
      class:   'ac-test',
      fields:  [
        P(TESTS.BACKGROUND, 'topic'),
        ...TEST_FORM
      ]
    }
  ]
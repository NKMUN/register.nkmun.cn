import {FT, FN, FP, FR, O, TA, H, P} from './_utilities'

const GENDER_OPTS = [O('男', 'm'), O('女', 'f')]

const SECTION_CONTACT = {
  section: '联系方式',
  class:   'contact',
  fields:  [
    FT('邮箱地址',   'email',    '请输入领队邮箱地址', ['required', 'email']),
    FP('密码',      'password', '包含大小写、数字、符号中的两种', ['required', 'password']),
    FT('姓名',      'name',     '请输入领队姓名',    ['required']),
    FR('性别',      'gender',   GENDER_OPTS,       ['required']),
    FT('手机号码',   'phone',    '请输入领队手机号码', ['required', 'phone']),
    FT('身份证号', 'residence_id', '身份证号码',    ['required', 'residenceId'])
  ]
}

export default [
  SECTION_CONTACT
]
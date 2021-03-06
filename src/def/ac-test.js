let AC_TEST = []
const T = (text) => {
  AC_TEST.push({
    text: text,
    dbId: `ac_paper.${AC_TEST.length}`,
    name: `题目${AC_TEST.length+1}`
  })
}

import {P, TA, mergeArray} from './_utilities'
function toFormNodes({text, dbId, name}) {
  return [
    P(text, 'question'),
    TA(name, dbId, '', ['required'])
  ]
}

/*
 * Define acdamic test questions below
 */

T('1、请简述贵校过去三年内参加汇文模联的情况，包括但不限于参会人数、获奖人数及奖项、学术团队人数及职位等，字数不限。')
T('2、请简述贵校模联社团组织模式、活动开展方式及三年内主要参会情况等，500字以内。')
T('3、汇文模联一致致力于培养深具公民意识与人文精神的公民。请简述你的理解中，此两种培养目标该如何在模联活动（特别是汇文模联）中实践，500字以内。')
T('4、请简述贵校对2017寒假汇文模联的建议与期待，500字以内。')

export default AC_TEST
export const form = AC_TEST.map( toFormNodes ).reduce( mergeArray )

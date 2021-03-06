const G = (name, id, ...keys) => ({name, id, keys})
const L = (name, dbId) => ({name, dbId})
import {mergeArray} from './_utilities'
function ungroupCommittees(groups) {
  return groups.map( $=>$.keys ).reduce( mergeArray )
}
function idToName(committees) {
  return committees.reduce( (m, {name, dbId}) => { m[dbId]=name; return m }, { 'loc_absent_leader': '不参会领队' } )
}
function canBeLeader(committee) {
  return committee!=='loc_superv' && committee!=='loc_observer'
}

/*
 * Define committees below
 */

const CN = G('中文会场', 'cn',
  L('联合国大会第三委员会', 'loc_cn_1'),
  L('人权理事会', 'loc_cn_2'),
  L('欧盟峰会', 'loc_cn_3'),
  L('1812法兰克福停战会议', 'loc_cn_4'),
)

const CS = G('中国系统', 'chn_system',
  L('中国系统-政府', 'loc_cs_1'),
  L('中国系统-人大', 'loc_cs_2'),
  L('中国系统-公众', 'loc_cs_3'),
)

const EN = G ('英文会场', 'en',
  L('UNSC', 'loc_en_1'),
  L('GA', 'loc_en_2'),
  L('UNIDO', 'loc_en_3'),
  L('FAO', 'loc_en_4'),
  L('UNESCO', 'loc_en_5'),
)

const SP = G('特殊会场', 'special',
  L('汇文省经济贸易高峰会', 'loc_biz'),
  L('媒体团队',  'loc_media'),
)

const ETC = G('其他', 'etc',
  L('指导教师',  'loc_superv'),
  L('观察员',    'loc_observer')
  // NOTE: loc_absent_leader: 不参会领队
)

const committees = [CN, CS, EN, SP, ETC]
const exchangableCommittees = [CN, CS, EN, SP]

export const groups = committees
export const ungrouped = ungroupCommittees(committees)

export const exchangableGroups = exchangableCommittees
export const exchangableUngrouped = ungroupCommittees(exchangableCommittees)

export const idMapping = idToName(ungrouped)
export {canBeLeader}
export default ungrouped

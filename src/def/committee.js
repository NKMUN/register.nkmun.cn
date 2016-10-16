const G = (name, id, ...keys) => ({name, id, keys})
const L = (name, dbId) => ({name, dbId})
import {mergeArray} from './_utilities'
function ungroupCommittees(groups) {
  return groups.map( $=>$.keys ).reduce( mergeArray )
}
function idToName(committees) {
  return committees.reduce( (m, {name, dbId}) => { m[dbId]=name; return m }, {} )
}

/*
 * Define committees below
 */

const committees = [
  G('中文会场', 'cn',
    L('联合国大会第三委员会', 'loc_cn_1'),
    L('人权理事会', 'loc_cn_2'),
    L('欧盟峰会', 'loc_cn_3'),
    L('1813法兰克福停战会议', 'loc_cn_4'),
  ),
  G('中国系统', 'chn_system',
    L('中国系统-省政府', 'loc_cs_1'),
    L('中国系统-人大', 'loc_cs_2'),
    L('中国系统-公众', 'loc_cs_3'),
  ),
  G('英文会场', 'en',
    L('UNSC', 'loc_en_1'),
    L('GA', 'loc_en_2'),
    L('UNIDO', 'loc_en_3'),
    L('FAO', 'loc_en_4'),
    L('UNESCO', 'loc_en_5'),
  ),
  G('特殊会场', 'special',
    L('汇文省经济贸易高峰会', 'loc_biz'),
    L('媒体团队',  'loc_media'),
  ),
  G('其他', 'etc',
    L('指导教师',  'loc_superv'),
    L('观察员',    'loc_observer')
  )
]

export const groups = committees
export const ungrouped = ungroupCommittees(committees)
export const idMapping = idToName(ungrouped)
export default ungrouped

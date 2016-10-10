const G = (name, id, ...keys) => ({name, id, keys})
const L = (name, dbId) => ({name, dbId})
import {mergeArray} from './_utilities'
function ungroupCommittees(groups) {
  return groups.map( $=>$.keys ).reduce( mergeArray )
}

/*
 * Define committees below
 */

const committees = [
  G('中文', 'cn',
    L('联合国大会第三委员会', 'loc_cn_1'),
    L('人权理事会', 'loc_cn_2'),
    L('欧盟峰会', 'loc_cn_3'),
    L('1813法兰克福停战会议', 'loc_cn_4'),
    L('中国系统-省政府', 'loc_cs_1'),
    L('中国系统-人大', 'loc_cs_2'),
    L('中国系统-公众', 'loc_cs_3'),
    L('商赛',     'loc_biz'),
  ),
  G('英文', 'en',
    L('UNSC', 'loc_en_1'),
    L('GA', 'loc_en_2'),
    L('UNIDO', 'loc_en_3'),
    L('FAO', 'loc_en_4'),
    L('UNESCO', 'loc_en_5'),
  ),
  G('媒体', 'press',
    L('媒体团队',  'loc_media'),
  ),
  G('其他', 'etc',
    L('指导教师',  'loc_superv'),
    L('观察员',    'loc_observer')
  )
]

export default ungroupCommittees(committees)
export const groups = committees

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
    L('中文会场1', 'loc_cn_1'),
    L('中文会场2', 'loc_cn_2'),
    L('中文会场3', 'loc_cn_3'),
    L('中文会场4', 'loc_cn_4'),
    L('中国系统1', 'loc_cs_1'),
    L('中国系统2', 'loc_cs_2'),
    L('中国系统3', 'loc_cs_3'),
    L('商赛',     'loc_biz'),
  ),
  G('英文', 'en',
    L('英文会场1', 'loc_en_1'),
    L('英文会场2', 'loc_en_2'),
    L('英文会场3', 'loc_en_3'),
    L('英文会场4', 'loc_en_4'),
    L('英文会场5', 'loc_en_5'),
  ),
  G('其他', 'etc',
    L('媒体团队',  'loc_media'),
    L('联动体系',  'loc_linkage'),
    L('指导教师',  'loc_superv'),
    L('观察员',    'loc_observer')
  )
]

export default ungroupCommittees(committees)
export const groups = committees

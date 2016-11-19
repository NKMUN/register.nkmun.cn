import {groups as COMMITTEE_GROUPS, ungrouped as committees, idMapping as committee_name} from '../def/committee'
import keys from 'object-keys'
import unique from 'array-unique'

const strcmp = (a, b) => a.localeCompare(b)

export default function displayCommittee(c1 = {}, c2 = {}) {
    return unique([ ...keys(c1), ...keys(c2) ])
           .sort( strcmp )
           .map( key => ({
               key,
               quota: [ c1[key] || 0, c2[key] || 0 ]
           }))
           .map( ({key, quota: q }) => ({
               key,
               name: committee_name[key],
               quota: [ q[0]+q[1], ...q ]
           }))
           .filter( $ => $.quota[0] && $.name )
}

import {idMapping as name} from '../def/committee'
import keys from 'object-keys'
import unique from 'array-unique'

const strcmp = (a, b) => a.localeCompare(b)

function merge(c1 = {}, c2 = {}) {
    let ret = {}
    unique([ ...keys(c1), ...keys(c2) ])
    .forEach( key => {
        let q1 = c1[key] || 0
        let q2 = c2[key] || 0
        ret[key] = [q1+q2, q1, q2]
    })
    return ret
}

function toArray(committee) {
    return keys( committee )
           .sort( strcmp )
           .map( key => ({
               key,
               name: name[key],
               quota: committee[key]
           }))
           .filter( $ => $.quota[0] && $.name )
}

export {merge, toArray}

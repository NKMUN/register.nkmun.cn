export function configRouter (router) {
  // normal routes
  router.map({
    '/': {
      component: require('./components/Home.vue')
    },
    '/enroll': {
      component: require('./components/Enroll.vue'),
    },
    '/enroll/success': {
      component: require('./components/EnrollSuccess.vue')
    },
    '/enroll/failure': {
      component: require('./components/EnrollFailure.vue')
    },
    // not found handler
    '*': {
      component: require('./components/Home.vue')
    }
  })

  // redirect
  router.redirect({
  })

  // global beforen
  // 3 options:
  // 1. return a boolean
  // 2. return a Promise that resolves to a boolean
  // 3. call transition.next() or transition.abort()

}

export function configRouter (router) {
  // normal routes
  router.map({
    '/': {
      component: require('./components/Home.vue')
    },
    '/enroll': {
      component: require('./components/Enroll.vue'),
    },
    '/enroll/result': {
      component: require('./components/EnrollResult.vue')
    },
    '/invitation': {
      component: require('./components/Invitation/Invitation.vue')
    },
    '/invitation/disclaimer': {
      component: require('./components/Invitation/Disclaimer.vue')
    },
    '/invitation/registration': {
      component: require('./components/Invitation/Registration.vue')
    },
    '/invitation/success': {
      component: require('./components/Invitation/Success.vue')
    },
    '/login': {
      component: require('./components/Login.vue')
    },
    '/generic-failure': {
      component: require('./components/GenericFailure.vue')
    },
    '/admin': {
      component: require('./components/Admin/Home.vue'),
      subRoutes: {
        '/enroll': {
          component: require('./components/Admin/Enroll.vue')
        }
      }
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

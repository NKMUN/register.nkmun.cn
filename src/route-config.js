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
    '/login': {
      component: require('./components/Login.vue')
    },
    '/generic-failure': {
      component: require('./components/GenericFailure.vue')
    },
    '/admin': {
      component: require('./components/Admin/Home.vue'),
      subRoutes: {
        '/enroll':   { component: require('./components/Admin/Enroll.vue') },
        '/status':   { component: require('./components/Admin/Status.vue') },
        '/payment':  { component: require('./components/Admin/PaymentReview.vue') },
        '/stage2':   { component: require('./components/Admin/Stage2.vue') },
        '/payment2': { component: require('./components/Admin/PaymentReview2.vue') },
        '/representative': { component: require('./components/Admin/Representative.vue') }
      }
    },
    'team': {
      component: require('./components/Team/Home.vue'),
      subRoutes: {
        'overview':       { component: require('./components/Team/Overview.vue') },
        'exchange':       { component: require('./components/Team/Exchange.vue') },
        'accommodation':  { component: require('./components/Team/Accommodation.vue') },
        'payment':        { component: require('./components/Team/Payment.vue') },
        'accommodation2': { component: require('./components/Team/Accommodation2.vue') },
        'payment2':       { component: require('./components/Team/Payment2.vue') },
        'representative': { component: require('./components/Team/Representative.vue') },
        'confirm':        { component: require('./components/Team/Confirm.vue') }
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

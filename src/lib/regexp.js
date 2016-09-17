import EmailRegex from 'email-regex'

const email = EmailRegex({exact: 'true'})
const enName = /^[a-zA-Z0-9_\- .,]+$/
const phone = /^1[34578]\d{9}$/

export {email, enName, phone}

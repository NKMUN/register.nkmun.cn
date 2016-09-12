
function getFields(form) {
  return Array.prototype.slice.call( form.querySelectorAll('input, textarea') )
         .map( $ => $.id || $.name || $.field )
}

function getStore() {
  let store = window.localStorage
  if (store)
    return store
  else
    return {    // no-op store
      getItem() { return null },
      setItem() {},
      removeItem() {}
    }
}

export function forgetForm() {
  this.clear = true
  let store = getStore()
  getFields(this.$els.form)
  .forEach( key => store.removeItem(this.SIG + key) )
}

export function storeForm() {
  if (this.clear)
    return false
  let form = this.$els.form
  let store = getStore()
  getFields(form)
  .forEach( key => store.setItem(this.SIG + key, form[key].value) )
}

export function restoreForm() {
  this.clear = false
  let form = this.$els.form
  let store = getStore()
  form.reset()
  getFields(form)
  .forEach( key => {
    let val = store.getItem(this.SIG + key)
    if (val) {
      form[key].value = val
      this.$validate(key, true)
    }
  })
}

export function resetForm() {
  this.$els.form.reset()
}
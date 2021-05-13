/* global chrome */

// DATA
// variables and classes are hoisted but not initialized if invoked before declaration
const defaults = {
  none: null,
}

class Setting {
  constructor (name, value) {
    this.name = name
    this.value = value
    this.input = document.querySelector('#opt-' + this.name)
  }

  // update placeholder and clear input field
  clear () {
    if (this.input.type !== 'select-one') {
      this.input.placeholder = this.value
      this.input.value = null // clear input
    } else {
      this.input.options[this.value].selected = true
    }
  }

  // read value from input field
  read () {
    if (this.input.value !== '' & this.input.value != null) { // ignore null
      this.value = this.input.value
      this.clear()
    }
    if (this.input.type === 'select-one' || this.input.type === 'number') {
      this.value = parseInt(this.value)
    }
    return [this.name, this.value]
  }

  // reset to default value
  reset () {
    this.value = defaults[this.name]
    this.clear()
  }
}

// init 'Setting' objects
const settings = []
for (const opt of Object.entries(defaults)) {
  settings.push(new Setting(opt[0], opt[1]))
}

const statusBar = document.querySelector('#status')

// MAIN
// Get settings from chrome.storage (use default when missing)
getData(defaults)

// Monitor click events
window.onload = () => {
  document.querySelector('#opt-save').onclick = getOpts
  document.querySelector('#opt-reset').onclick = resetOpts
}

// LIB
// GET settings from chrome.storage
function getData (query) {
  const request = new Promise((resolve, reject) => {
    try {
      chrome.storage.sync.get(query, resolve)
    } catch (e) {
      reject(e)
    }
  })
  request.then(setOpt)
}

// SET value for each setting
async function setOpt (data) {
  for (const opt of settings) {
    opt.value = data[opt.name]
    opt.clear()
  }
}

// Display a status message
function setStatus (text) {
  // set message
  statusBar.innerHTML = text
  // clear after 3s
  setTimeout(() => { statusBar.innerHTML = null }, 3000)
}

// SET settings to chrome.storage
function setData (payload, message) {
  const request = new Promise((resolve, reject) => {
    try {
      chrome.storage.sync.set(payload, resolve)
    } catch (e) {
      reject(e)
    }
  })
  request.then(status => setStatus(message), console.log)
}

// GET settings values from objects
function getOpts () {
  const payload = new Object() // eslint-disable-line no-new-object
  for (const opt of settings) {
    const data = opt.read()
    const name = data[0]
    const value = data[1]
    payload[name] = value
    opt.clear()
  }
  setData(payload, 'Options successfully saved.') // store opts
}

// Reset settings to default values
async function resetOpts () {
  for (const opt of settings) {
    opt.reset()
  }
  setData(defaults, 'Options successfully reset to defaults.') // store opts
}

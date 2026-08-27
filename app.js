const i18n = require('./utils/i18n.js')
const config = require('./utils/config.js')
const api = require('./utils/api.js')

App({
  onLaunch() {
    // Один раз генерируем/читаем device-токен. Он используется как openid.
    api.ensureToken()

    // Если API_BASE пустой — крутимся в демо-режиме (сервер не подключён).
    this.globalData.demoMode = api.isDemo()

    this.globalData.lang = i18n.getLang()
    this.globalData.role = i18n.getRole()
    setTimeout(() => i18n.applyTabBar(this.globalData.lang, this.globalData.role), 300)

    this.ensureSession()
  },

  // Однократный логин; страницы могут дождаться через whenReady()
  ensureSession() {
    if (this._sessionPromise) return this._sessionPromise
    this._sessionPromise = api.login().then((s) => {
      this.globalData.session = s || null
      this.globalData.openid = s && s.openid
      this.globalData.isAdmin = !!(s && s.isAdmin)
      if (s && s.role) {
        this.globalData.role = s.role
        i18n.setRole(s.role)
      }
      return s
    }).catch((e) => {
      console.error('login failed', e)
      this._sessionPromise = null
      return null
    })
    return this._sessionPromise
  },

  whenReady() {
    return this.ensureSession()
  },

  onLangChange(lang) {
    this.globalData.lang = lang
    i18n.setLang(lang)
  },

  onRoleChange(role) {
    this.globalData.role = role
    i18n.setRole(role)
  },

  globalData: {
    lang: 'zh',
    role: 'client',
    brand: config.BRAND,
    session: null,
    openid: null,
    isAdmin: false,
    demoMode: false
  }
})

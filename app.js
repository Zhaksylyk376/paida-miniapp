const i18n = require('./utils/i18n.js')
const config = require('./utils/config.js')
const api = require('./utils/api.js')

App({
  onLaunch() {
    const env = this.globalData.cloudEnv
    const cloudReady = !!wx.cloud && env && env !== 'REPLACE_WITH_YOUR_ENV_ID'
    this.globalData.demoMode = !cloudReady

    if (cloudReady) {
      wx.cloud.init({ env, traceUser: true })
    } else {
      console.warn('[Paida] Демо-режим: облако не настроено (пропиши cloudEnv в app.js). Сервер отключён, UI работает как витрина.')
    }
    api._setDemo(this.globalData.demoMode)

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
    // ⚠️ ВПИШИ СЮДА env-id своего облака (из консоли 云开发 → Настройки → env ID)
    // Если оставить 'REPLACE_WITH_YOUR_ENV_ID' — приложение запустится в
    // ДЕМО-РЕЖИМЕ (без сервера). Все списки будут пусты, но UI работает.
    cloudEnv: 'REPLACE_WITH_YOUR_ENV_ID',

    lang: 'zh',
    role: 'client',
    brand: config.BRAND,
    session: null,
    openid: null,
    isAdmin: false,
    demoMode: false
  }
})

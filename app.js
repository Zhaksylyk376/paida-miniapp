const i18n = require('./utils/i18n.js')
const config = require('./utils/config.js')
const api = require('./utils/api.js')

App({
  onLaunch() {
    // --- Инициализация облака WeChat ---
    if (!wx.cloud) {
      console.error('Требуется базовая библиотека 2.2.3+ и включённое облако (云开发)')
    } else {
      wx.cloud.init({
        env: this.globalData.cloudEnv,   // ← впиши env-id своего облака ниже в globalData
        traceUser: true
      })
    }

    this.globalData.lang = i18n.getLang()
    this.globalData.role = i18n.getRole()
    setTimeout(() => i18n.applyTabBar(this.globalData.lang, this.globalData.role), 300)

    // Логинимся: получаем openid, роль, статус водителя и права админа
    this.ensureSession()
  },

  // Однократный логин; страницы могут дождаться через whenReady()
  ensureSession() {
    if (this._sessionPromise) return this._sessionPromise
    this._sessionPromise = api.login().then((s) => {
      this.globalData.session = s
      this.globalData.openid = s.openid
      this.globalData.isAdmin = s.isAdmin
      if (s.role) {
        this.globalData.role = s.role
        i18n.setRole(s.role)
      }
      return s
    }).catch((e) => {
      console.error('login failed', e)
      this._sessionPromise = null   // разрешим повторить позже
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
    cloudEnv: 'REPLACE_WITH_YOUR_ENV_ID',

    lang: 'zh',
    role: 'client',
    brand: config.BRAND,
    session: null,
    openid: null,
    isAdmin: false
  }
})

const app = getApp()
const i18n = require('../../utils/i18n.js')

Page({
  data: {
    t: {},
    lang: 'zh',
    role: 'client',
    profile: null
  },

  onShow() {
    this.refreshAll()
  },

  refreshAll() {
    const lang = i18n.getLang()
    const role = i18n.getRole()
    const t = i18n.t(lang)
    this.setData({
      lang, role, t,
      profile: role === 'driver' ? app.getDriverProfile() : null
    })
    wx.setNavigationBarTitle({ title: role === 'driver' ? t.nav_about_d : t.nav_about })
  },

  switchLang(e) {
    const lang = e.currentTarget.dataset.lang
    if (lang === this.data.lang) return
    app.onLangChange(lang)
    this.refreshAll()
    wx.showToast({ title: i18n.t(lang).about_toast_lang_changed, icon: 'success', duration: 1200 })
  },

  switchRole(e) {
    const role = e.currentTarget.dataset.role
    if (role === this.data.role) return
    app.onRoleChange(role)
    this.refreshAll()
    const t = this.data.t
    wx.showToast({
      title: role === 'driver' ? t.role_toast_driver : t.role_toast_client,
      icon: 'success',
      duration: 1200
    })
  },

  editProfile() {
    wx.navigateTo({ url: '/pages/driver-register/driver-register?edit=1' })
  }
})

const app = getApp()
const i18n = require('../../utils/i18n.js')
const api = require('../../utils/api.js')

Page({
  data: {
    t: {},
    lang: 'zh',
    role: 'client',
    profile: null,
    kyc: null,
    kycStatusLabel: ''
  },

  async onShow() {
    await app.whenReady()
    this.refreshAll()
  },

  async refreshAll() {
    const lang = i18n.getLang()
    const role = i18n.getRole()
    const t = i18n.t(lang)
    this.setData({ lang, role, t })
    wx.setNavigationBarTitle({ title: role === 'driver' ? t.nav_about_d : t.nav_about })

    if (role === 'driver') {
      try { this.setData({ profile: await api.driverGet() }) }
      catch (e) { this.setData({ profile: null }) }
      this.setData({ kyc: null, kycStatusLabel: '' })
    } else {
      this.setData({ profile: null })
      try {
        const kyc = await api.clientKycGet()
        this.setData({
          kyc,
          kycStatusLabel: kyc ? (t['kyc_status_' + kyc.status] || '') : t.kyc_status_none
        })
      } catch (e) { this.setData({ kyc: null, kycStatusLabel: t.kyc_status_none }) }
    }
  },

  goKyc() {
    wx.navigateTo({ url: '/pages/client-kyc/client-kyc' })
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

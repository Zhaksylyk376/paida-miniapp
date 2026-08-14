const i18n = require('./utils/i18n.js')
const config = require('./utils/config.js')

App({
  onLaunch() {
    this.globalData.lang = i18n.getLang()
    this.globalData.role = i18n.getRole()
    setTimeout(() => i18n.applyTabBar(this.globalData.lang, this.globalData.role), 300)
  },

  onLangChange(lang) {
    this.globalData.lang = lang
    i18n.setLang(lang)
  },

  onRoleChange(role) {
    this.globalData.role = role
    i18n.setRole(role)
  },

  getDriverProfile() {
    return wx.getStorageSync('driver_profile') || null
  },
  setDriverProfile(profile) {
    wx.setStorageSync('driver_profile', profile)
  },
  clearDriverProfile() {
    wx.removeStorageSync('driver_profile')
  },

  getDriverLoads() {
    return wx.getStorageSync('driver_loads') || []
  },
  setDriverLoads(loads) {
    wx.setStorageSync('driver_loads', loads)
  },
  updateDriverLoad(id, patch) {
    const loads = this.getDriverLoads()
    const idx = loads.findIndex(l => l.id === Number(id))
    if (idx === -1) return null
    loads[idx] = Object.assign({}, loads[idx], patch)
    this.setDriverLoads(loads)
    return loads[idx]
  },

  globalData: {
    lang: 'zh',
    role: 'client',
    brand: config.BRAND
  }
})

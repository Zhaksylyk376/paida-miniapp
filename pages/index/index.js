const app = getApp()
const i18n = require('../../utils/i18n.js')

Page({
  data: {
    t: {},
    role: 'client',
    profile: null,
    stats: { active: 0, done: 0 },
    advantages: [],
    howSteps: []
  },

  onShow() { this.refreshAll() },
  onLangChanged() { this.refreshAll() },

  refreshAll() {
    const lang = i18n.getLang()
    const role = i18n.getRole()
    const t = i18n.t(lang)

    this.setData({
      t, role,
      profile: role === 'driver' ? app.getDriverProfile() : null,
      stats: this._calcStats(),
      howSteps: [
        { id: 1, num: '1', title: t.how_1_title, desc: t.how_1_desc },
        { id: 2, num: '2', title: t.how_2_title, desc: t.how_2_desc },
        { id: 3, num: '3', title: t.how_3_title, desc: t.how_3_desc },
        { id: 4, num: '4', title: t.how_4_title, desc: t.how_4_desc }
      ],
      advantages: [
        { id: 1, num: '1', title: t.adv1_title, desc: t.adv1_desc },
        { id: 2, num: '2', title: t.adv2_title, desc: t.adv2_desc },
        { id: 3, num: '3', title: t.adv3_title, desc: t.adv3_desc },
        { id: 4, num: '4', title: t.adv4_title, desc: t.adv4_desc },
        { id: 5, num: '5', title: t.adv5_title, desc: t.adv5_desc }
      ]
    })
    wx.setNavigationBarTitle({ title: t.nav_home })
  },

  _calcStats() {
    const loads = app.getMyDriverOrders()
    return {
      active: loads.filter(l => l.status !== 'delivered').length,
      done: loads.filter(l => l.status === 'delivered').length
    }
  },

  goToOrder() { wx.switchTab({ url: '/pages/order/order' }) },
  goToProcess() { wx.switchTab({ url: '/pages/tracking/tracking' }) },
  goToAvailable() { wx.switchTab({ url: '/pages/tracking/tracking' }) },
  goToMyLoads() { wx.switchTab({ url: '/pages/order/order' }) },
  goToRegister() { wx.navigateTo({ url: '/pages/driver-register/driver-register' }) }
})

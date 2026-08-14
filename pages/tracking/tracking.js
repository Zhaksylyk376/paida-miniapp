const app = getApp()
const i18n = require('../../utils/i18n.js')

Page({
  data: {
    t: {},
    role: 'client',
    steps: [],
    load: { number: '', route: '', client: '', clientWechat: '', price: '', note: '' }
  },

  onShow() { this.applyLang() },
  onLangChanged() { this.applyLang() },

  applyLang() {
    const lang = i18n.getLang()
    const role = i18n.getRole()
    const t = i18n.t(lang)
    this.setData({
      t, role,
      steps: [
        { id: 1, num: '1', title: t.process_1_title, desc: t.process_1_desc },
        { id: 2, num: '2', title: t.process_2_title, desc: t.process_2_desc },
        { id: 3, num: '3', title: t.process_3_title, desc: t.process_3_desc },
        { id: 4, num: '4', title: t.process_4_title, desc: t.process_4_desc }
      ]
    })
    wx.setNavigationBarTitle({ title: role === 'driver' ? t.nav_add_load : t.nav_process })
  },

  onLoadInput(e) {
    const field = e.currentTarget.dataset.field
    this.setData({ [`load.${field}`]: e.detail.value })
  },

  addLoad() {
    const t = this.data.t
    const { number, route } = this.data.load
    if (!number || !route) {
      wx.showToast({ title: t.add_load_toast_required, icon: 'none' })
      return
    }
    const load = Object.assign({}, this.data.load, {
      id: Date.now(),
      status: 'new',
      createdAt: Date.now(),
      history: [{ status: 'new', at: Date.now() }]
    })
    const loads = app.getDriverLoads()
    loads.unshift(load)
    app.setDriverLoads(loads)

    this.setData({ load: { number: '', route: '', client: '', clientWechat: '', price: '', note: '' } })
    wx.showToast({ title: t.add_load_success, icon: 'success' })
    setTimeout(() => wx.switchTab({ url: '/pages/order/order' }), 700)
  }
})

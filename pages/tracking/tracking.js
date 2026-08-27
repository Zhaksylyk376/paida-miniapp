const app = getApp()
const i18n = require('../../utils/i18n.js')

Page({
  data: {
    t: {},
    role: 'client',
    steps: [],
    availableOrders: []
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
    if (role === 'driver') this.refreshAvailable()
    wx.setNavigationBarTitle({ title: role === 'driver' ? t.nav_available_orders : t.nav_process })
  },

  refreshAvailable() {
    const t = this.data.t
    const orders = app.getAvailableOrders().map(o => {
      const dest = [o.countryName, o.toCity].filter(Boolean).join(', ')
      const route = [o.fromCity, dest].filter(Boolean).join(' → ')
      const cargoParts = [
        o.goodsType,
        o.weight ? `${o.weight} ${t.calc_kg}` : '',
        o.volume ? `${o.volume} m³` : ''
      ].filter(Boolean)
      return {
        id: o.id,
        number: o.number,
        route,
        cargo: cargoParts.join(' · '),
        price: o.price && o.price.total ? o.price.total : '',
        createdStr: this._fmtTime(o.createdAt)
      }
    })
    this.setData({ availableOrders: orders })
  },

  takeOrder(e) {
    const id = Number(e.currentTarget.dataset.id)
    const t = this.data.t
    wx.showModal({
      title: t.available_take_confirm_title,
      content: t.available_take_confirm_msg,
      confirmText: t.available_take_yes,
      cancelText: t.available_take_no,
      success: (res) => {
        if (!res.confirm) return
        app.takeOrder(id)
        wx.showToast({ title: t.available_take_success, icon: 'success' })
        this.refreshAvailable()
        setTimeout(() => wx.navigateTo({ url: `/pages/contract/contract?id=${id}` }), 400)
      }
    })
  },

  _fmtTime(ts) {
    const d = new Date(ts || Date.now())
    const p = n => String(n).padStart(2, '0')
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`
  }
})

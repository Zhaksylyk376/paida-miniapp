const app = getApp()
const i18n = require('../../utils/i18n.js')
const api = require('../../utils/api.js')

Page({
  data: {
    t: {},
    role: 'client',
    steps: [],
    availableOrders: [],
    // допуск водителя: null | pending | approved | rejected | none
    gate: 'approved'
  },

  async onShow() {
    await app.whenReady()
    this.applyLang()
  },
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
    wx.setNavigationBarTitle({ title: role === 'driver' ? t.nav_available_orders : t.nav_process })
    if (role === 'driver') this.refreshAvailable()
  },

  async refreshAvailable() {
    const t = this.data.t
    try {
      const orders = await api.availableOrders()
      const list = orders.map(o => {
        const dest = [o.countryName, o.toCity].filter(Boolean).join(', ')
        const route = [o.fromCity, dest].filter(Boolean).join(' → ')
        const cargoParts = [
          o.goodsType,
          o.weight ? `${o.weight} ${t.calc_kg}` : '',
          o.volume ? `${o.volume} m³` : ''
        ].filter(Boolean)
        return {
          id: o._id,
          number: o.number,
          route,
          cargo: cargoParts.join(' · '),
          price: o.price && o.price.total ? o.price.total : '',
          createdStr: this._fmtTime(o.createdAt),
          applied: !!o.applied
        }
      })
      this.setData({ gate: 'approved', availableOrders: list })
    } catch (err) {
      // Водитель не одобрен / нет анкеты — показываем экран-заглушку
      const code = (err && err.code) || ''
      if (code === 'NO_PROFILE') this.setData({ gate: 'none' })
      else if (code === 'NOT_APPROVED') this.setData({ gate: 'pending' })
      else this.setData({ gate: 'pending' })
    }
  },

  async applyOrder(e) {
    const id = e.currentTarget.dataset.id
    const t = this.data.t
    try {
      await api.orderApply(id, '')
      wx.showToast({ title: t.apply_success, icon: 'success' })
      this.refreshAvailable()
    } catch (err) {
      wx.showToast({ title: this._err(err), icon: 'none' })
      if ((err && err.code) === 'TAKEN') this.refreshAvailable()
    }
  },

  goRegister() {
    wx.navigateTo({ url: '/pages/driver-register/driver-register' })
  },

  _fmtTime(ts) {
    const d = new Date(ts || Date.now())
    const p = n => String(n).padStart(2, '0')
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`
  },

  _err(err) {
    const t = this.data.t
    const code = (err && err.code) || 'generic'
    return t['err_' + code] || (err && err.msg) || t.err_generic
  }
})

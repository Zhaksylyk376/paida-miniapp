const app = getApp()
const i18n = require('../../utils/i18n.js')
const calc = require('../../utils/calculator.js')
const api = require('../../utils/api.js')

Page({
  data: {
    t: {},
    role: 'client',
    // client — форма
    countries: [],
    selectedCountryIndex: 0,
    form: {
      fromCity: '',
      countryCode: '', countryName: '', toCity: '',
      goodsType: '', weight: '', volume: '',
      name: '', phone: '', wechat: '', note: ''
    },
    price: null,
    priceFormatted: '',
    loading: false,
    // client — мои заказы
    myOrders: [],
    // driver — мои рейсы
    filter: 'active',
    counts: { active: 0, done: 0 },
    filteredLoads: []
  },

  async onShow() {
    await app.whenReady()
    this.applyLang()
    if (i18n.getRole() === 'driver') this.refreshLoads()
    else this.refreshMyOrders()
  },

  onLangChanged() {
    this.applyLang()
    if (this.data.role === 'driver') this.refreshLoads()
    else this.refreshMyOrders()
  },

  applyLang() {
    const lang = i18n.getLang()
    const role = i18n.getRole()
    const t = i18n.t(lang)
    const countries = calc.getCountriesList(lang)

    let countryName = this.data.form.countryName
    if (this.data.form.countryCode) {
      const found = countries.find(c => c.code === this.data.form.countryCode)
      countryName = found ? found.name : ''
    }

    this.setData({ t, role, countries, 'form.countryName': countryName })
    wx.setNavigationBarTitle({ title: role === 'driver' ? t.nav_my_loads : t.nav_order })
    if (role === 'client') this.recalc()
  },

  // =================== CLIENT: форма ===================
  onInput(e) {
    const field = e.currentTarget.dataset.field
    this.setData({ [`form.${field}`]: e.detail.value })
    if (field === 'weight' || field === 'volume') this.recalc()
  },

  onCountryChange(e) {
    const idx = Number(e.detail.value)
    const country = this.data.countries[idx]
    this.setData({
      selectedCountryIndex: idx,
      'form.countryCode': country.code,
      'form.countryName': country.name
    })
    this.recalc()
  },

  recalc() {
    const price = calc.calcPrice({
      countryCode: this.data.form.countryCode,
      weightKg: this.data.form.weight,
      volumeM3: this.data.form.volume
    })
    this.setData({
      price,
      priceFormatted: price ? calc.formatMoney(price.total, price.currency) : ''
    })
  },

  async submitOrder() {
    if (this.data.loading) return
    const { countryCode, name, phone, weight, volume } = this.data.form
    const t = this.data.t
    if (!countryCode || !name || !phone || (!weight && !volume)) {
      wx.showToast({ title: t.order_toast_required, icon: 'none' }); return
    }
    if (!/^\+?\d{7,15}$/.test(phone)) {
      wx.showToast({ title: t.order_toast_phone, icon: 'none' }); return
    }

    this.setData({ loading: true })
    try {
      const payload = Object.assign({}, this.data.form, { price: this.data.price })
      const res = await api.orderCreate(payload)
      this.setData({ loading: false })
      this._resetForm()
      this.refreshMyOrders()
      wx.showModal({
        title: t.order_success_title,
        content: t.order_success_msg + '\n\n' + res.number,
        showCancel: false,
        confirmText: t.order_success_btn
      })
    } catch (err) {
      this.setData({ loading: false })
      wx.showToast({ title: this._err(err), icon: 'none' })
    }
  },

  _resetForm() {
    this.setData({
      form: {
        fromCity: '',
        countryCode: '', countryName: '', toCity: '',
        goodsType: '', weight: '', volume: '',
        name: '', phone: '', wechat: '', note: ''
      },
      price: null, priceFormatted: '', selectedCountryIndex: 0
    })
  },

  // =================== CLIENT: мои заказы ===================
  async refreshMyOrders() {
    const t = this.data.t
    try {
      const orders = await api.myOrders()
      const list = orders.map(o => {
        const dest = [o.countryName, o.toCity].filter(Boolean).join(', ')
        const route = [o.fromCity, dest].filter(Boolean).join(' → ')
        return {
          id: o._id,
          number: o.number,
          status: o.status,
          statusLabel: this._statusLabel(o.status, t),
          route,
          appsCount: o.appsCount || 0,
          hasDriver: !!o.driverId,
          price: o.price && o.price.total ? o.price.total : ''
        }
      })
      this.setData({ myOrders: list })
    } catch (e) { /* тихо */ }
  },

  // Клиент открывает список откликов (или договор, если водитель уже выбран)
  openMyOrder(e) {
    const id = e.currentTarget.dataset.id
    const hasDriver = e.currentTarget.dataset.hasdriver
    if (hasDriver) {
      wx.navigateTo({ url: `/pages/contract/contract?id=${id}&role=client` })
    } else {
      wx.navigateTo({ url: `/pages/applications/applications?id=${id}` })
    }
  },

  // =================== DRIVER: мои рейсы ===================
  setFilter(e) {
    this.setData({ filter: e.currentTarget.dataset.filter })
    this.refreshLoads()
  },

  async refreshLoads() {
    const t = this.data.t
    try {
      const orders = await api.myLoads()
      const active = orders.filter(o => o.status !== 'delivered')
      const done = orders.filter(o => o.status === 'delivered')
      const chosen = this.data.filter === 'done' ? done : active

      const labeled = chosen.map(o => {
        const dest = [o.countryName, o.toCity].filter(Boolean).join(', ')
        const route = [o.fromCity, dest].filter(Boolean).join(' → ')
        return {
          id: o._id,
          number: o.number,
          status: o.status,
          route,
          client: [o.name, o.phone].filter(Boolean).join(' · '),
          price: o.price && o.price.total ? o.price.total : '',
          note: [o.goodsType, o.weight ? `${o.weight} ${t.calc_kg}` : '', o.volume ? `${o.volume} m³` : '']
                  .filter(Boolean).join(' · '),
          statusLabel: this._statusLabel(o.status, t)
        }
      })

      this.setData({
        counts: { active: active.length, done: done.length },
        filteredLoads: labeled
      })
    } catch (e) { /* тихо */ }
  },

  _statusLabel(status, t) {
    return ({
      new: t.status_new, taken: t.status_taken, loaded: t.status_loaded,
      in_transit: t.status_in_transit, at_border: t.status_at_border,
      delivered: t.status_delivered
    })[status] || status
  },

  openContract(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: `/pages/contract/contract?id=${id}` })
  },

  _err(err) {
    const t = this.data.t
    const code = (err && err.code) || 'generic'
    return t['err_' + code] || (err && err.msg) || t.err_generic
  }
})

const app = getApp()
const i18n = require('../../utils/i18n.js')
const api = require('../../utils/api.js')
const calc = require('../../utils/calculator.js')

// Порядок переходов статусов рейса
const STATUS_FLOW = {
  new:        [{ value: 'loaded',      emoji: '📦' }],
  loaded:     [{ value: 'in_transit',  emoji: '🚛' }],
  in_transit: [{ value: 'at_border',   emoji: '🛃' }, { value: 'delivered', emoji: '✅' }],
  at_border:  [{ value: 'in_transit',  emoji: '🚛' }, { value: 'delivered', emoji: '✅' }],
  delivered:  []
}

Page({
  data: {
    t: {},
    role: 'client',
    // client
    clientTypes: [],
    countries: [],
    selectedCountryIndex: 0,
    form: {
      clientType: 'private', fromCity: '',
      countryCode: '', countryName: '', toCity: '',
      goodsType: '', weight: '', volume: '', express: false,
      name: '', phone: '', note: ''
    },
    price: null,
    priceFormatted: '',
    loading: false,
    // driver
    filter: 'active',
    counts: { active: 0, done: 0 },
    filteredLoads: []
  },

  onShow() {
    this.applyLang()
    if (i18n.getRole() === 'driver') this.refreshLoads()
  },

  onLangChanged() {
    this.applyLang()
    if (this.data.role === 'driver') this.refreshLoads()
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

    this.setData({
      t, role, countries,
      clientTypes: [
        { value: 'private',  label: t.order_client_private },
        { value: 'business', label: t.order_client_business }
      ],
      'form.countryName': countryName
    })
    wx.setNavigationBarTitle({ title: role === 'driver' ? t.nav_my_loads : t.nav_order })
    if (role === 'client') this.recalc()
  },

  // =================== CLIENT ===================
  onInput(e) {
    const field = e.currentTarget.dataset.field
    this.setData({ [`form.${field}`]: e.detail.value })
    if (field === 'weight' || field === 'volume') this.recalc()
  },

  selectClientType(e) {
    this.setData({ 'form.clientType': e.currentTarget.dataset.value })
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

  toggleExpress() {
    this.setData({ 'form.express': !this.data.form.express })
    this.recalc()
  },

  recalc() {
    const price = calc.calcPrice({
      countryCode: this.data.form.countryCode,
      weightKg: this.data.form.weight,
      volumeM3: this.data.form.volume,
      express: this.data.form.express
    })
    this.setData({
      price,
      priceFormatted: price ? calc.formatMoney(price.total, price.currency) : ''
    })
  },

  submitOrder() {
    const { countryCode, name, phone, weight, volume } = this.data.form
    const t = this.data.t
    if (!countryCode || !name || !phone || (!weight && !volume)) {
      wx.showToast({ title: t.order_toast_required, icon: 'none' })
      return
    }
    if (!/^\+?\d{7,15}$/.test(phone)) {
      wx.showToast({ title: t.order_toast_phone, icon: 'none' })
      return
    }
    this.setData({ loading: true })
    const lang = i18n.getLang()
    const orderPayload = Object.assign({}, this.data.form, { price: this.data.price })

    api.sendOrder(orderPayload, lang)
      .then(() => {
        this.setData({ loading: false })
        wx.showModal({
          title: t.order_success_title,
          content: t.order_success_msg,
          showCancel: false,
          confirmText: t.order_success_btn,
          success: () => this._resetForm()
        })
      })
      .catch(err => {
        this.setData({ loading: false })
        wx.showModal({
          title: '⚠️',
          content: (err && err.message) || 'Ошибка отправки.',
          showCancel: false,
          confirmText: t.order_success_btn
        })
      })
  },

  _resetForm() {
    this.setData({
      form: {
        clientType: 'private', fromCity: '',
        countryCode: '', countryName: '', toCity: '',
        goodsType: '', weight: '', volume: '', express: false,
        name: '', phone: '', note: ''
      },
      price: null, priceFormatted: '', selectedCountryIndex: 0
    })
  },

  // =================== DRIVER ===================
  setFilter(e) {
    this.setData({ filter: e.currentTarget.dataset.filter })
    this.refreshLoads()
  },

  refreshLoads() {
    const t = this.data.t
    const loads = app.getDriverLoads()
    const active = loads.filter(l => l.status !== 'delivered')
    const done = loads.filter(l => l.status === 'delivered')
    const chosen = this.data.filter === 'done' ? done : active

    const labeled = chosen.map(l => Object.assign({}, l, {
      statusLabel: this._statusLabelFromT(l.status, t),
      nextStatuses: (STATUS_FLOW[l.status] || []).map(ns => ({
        value: ns.value,
        emoji: ns.emoji,
        label: this._statusLabelFromT(ns.value, t)
      }))
    }))

    this.setData({
      counts: { active: active.length, done: done.length },
      filteredLoads: labeled
    })
  },

  _statusLabelFromT(status, t) {
    return ({
      new:        t.status_new,
      loaded:     t.status_loaded,
      in_transit: t.status_in_transit,
      at_border:  t.status_at_border,
      delivered:  t.status_delivered
    })[status] || status
  },

  openContract(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: `/pages/contract/contract?id=${id}` })
  },

  deleteLoad(e) {
    const t = this.data.t
    const id = Number(e.currentTarget.dataset.id)
    wx.showModal({
      title: '',
      content: t.my_loads_delete_confirm,
      confirmText: t.my_loads_delete_yes,
      cancelText: t.my_loads_delete_no,
      success: (res) => {
        if (!res.confirm) return
        const loads = app.getDriverLoads().filter(l => l.id !== id)
        app.setDriverLoads(loads)
        this.refreshLoads()
      }
    })
  }
})

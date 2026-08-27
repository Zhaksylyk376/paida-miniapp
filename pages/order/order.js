const app = getApp()
const i18n = require('../../utils/i18n.js')
const calc = require('../../utils/calculator.js')

function _genOrderNumber() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let s = ''
  for (let i = 0; i < 4; i++) s += chars[Math.floor(Math.random() * chars.length)]
  return 'PAIDA-' + s
}

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
    countries: [],
    selectedCountryIndex: 0,
    form: {
      fromCity: '',
      countryCode: '', countryName: '', toCity: '',
      goodsType: '', weight: '', volume: '',
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

    const id = Date.now()
    const number = _genOrderNumber()
    const order = Object.assign({}, this.data.form, {
      id,
      number,
      price: this.data.price,
      status: 'new',
      createdAt: id,
      history: [{ status: 'new', at: id }]
    })
    app.addClientOrder(order)

    wx.showModal({
      title: t.order_success_title,
      content: t.order_success_msg + '\n\n' + number,
      confirmText: t.order_success_open,
      cancelText: t.order_success_btn,
      success: (res) => {
        this._resetForm()
        if (res.confirm) {
          wx.navigateTo({ url: `/pages/contract/contract?id=${id}&role=client` })
        }
      }
    })
  },

  _resetForm() {
    this.setData({
      form: {
        fromCity: '',
        countryCode: '', countryName: '', toCity: '',
        goodsType: '', weight: '', volume: '',
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
    const orders = app.getMyDriverOrders()
    const active = orders.filter(o => o.status !== 'delivered')
    const done = orders.filter(o => o.status === 'delivered')
    const chosen = this.data.filter === 'done' ? done : active

    const labeled = chosen.map(o => {
      const dest = [o.countryName, o.toCity].filter(Boolean).join(', ')
      const route = [o.fromCity, dest].filter(Boolean).join(' → ')
      return {
        id: o.id,
        number: o.number,
        status: o.status,
        route,
        client: [o.name, o.phone].filter(Boolean).join(' · '),
        price: o.price && o.price.total ? o.price.total : '',
        note: [o.goodsType, o.weight ? `${o.weight} ${t.calc_kg}` : '', o.volume ? `${o.volume} m³` : '']
                .filter(Boolean).join(' · '),
        statusLabel: this._statusLabelFromT(o.status, t)
      }
    })

    this.setData({
      counts: { active: active.length, done: done.length },
      filteredLoads: labeled
    })
  },

  _statusLabelFromT(status, t) {
    return ({
      new:        t.status_new,
      taken:      t.status_taken,
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

  releaseLoad(e) {
    const t = this.data.t
    const id = Number(e.currentTarget.dataset.id)
    wx.showModal({
      title: '',
      content: t.my_loads_release_confirm,
      confirmText: t.my_loads_release_yes,
      cancelText: t.my_loads_release_no,
      success: (res) => {
        if (!res.confirm) return
        app.releaseOrder(id)
        this.refreshLoads()
      }
    })
  }
})

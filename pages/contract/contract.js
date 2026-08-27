const app = getApp()
const i18n = require('../../utils/i18n.js')

const STATUS_FLOW = {
  new:        [],  // никаких переходов от new (нужно чтобы водитель сначала «взял»)
  taken:      [{ value: 'loaded',      emoji: '📦' }],
  loaded:     [{ value: 'in_transit',  emoji: '🚛' }],
  in_transit: [{ value: 'at_border',   emoji: '🛃' }, { value: 'delivered', emoji: '✅' }],
  at_border:  [{ value: 'in_transit',  emoji: '🚛' }, { value: 'delivered', emoji: '✅' }],
  delivered:  []
}

Page({
  data: {
    t: {},
    role: 'driver',
    load: null,
    driver: null,
    isClient: false,
    createdDate: '',
    statusLabel: '',
    historyLabeled: [],
    nextStatuses: [],
    clientPhone: '',
    clientAcceptedAt: 0,
    driverAcceptedAt: 0,
    clientAcceptedStr: '',
    driverAcceptedStr: '',
    canAdvance: false
  },

  onLoad(query) {
    this.loadId = Number(query.id)
    this.viewRole = query.role === 'client' ? 'client' : 'driver'
  },

  onShow() { this.refresh() },

  refresh() {
    const t = i18n.t(i18n.getLang())
    const isClient = this.viewRole === 'client'

    const raw = app.getClientOrder(this.loadId)
    if (!raw) {
      wx.showToast({ title: '×', icon: 'none' })
      setTimeout(() => wx.navigateBack(), 500)
      return
    }

    const load = this._shapeOrder(raw)
    const driver = raw.driverId ? app.getDriverProfile() : null
    const clientPhone = raw.phone || ''

    const historyLabeled = (raw.history || []).slice().reverse().map(h => ({
      label: this._statusLabel(h.status, t),
      timeStr: this._fmtTime(h.at)
    }))

    const driverAcceptedAt = raw.driverAcceptedAt || 0
    const clientAcceptedAt = raw.clientAcceptedAt || 0
    const canAdvance = !isClient && driverAcceptedAt > 0

    const nextStatuses = (!isClient && canAdvance)
      ? (STATUS_FLOW[raw.status] || []).map(ns => ({
          value: ns.value,
          emoji: ns.emoji,
          label: this._statusLabel(ns.value, t)
        }))
      : []

    this.setData({
      t, load, driver, isClient,
      role: this.viewRole,
      createdDate: this._fmtTime(raw.createdAt),
      statusLabel: this._statusLabel(raw.status, t),
      historyLabeled,
      nextStatuses,
      clientPhone,
      clientAcceptedAt,
      driverAcceptedAt,
      clientAcceptedStr: clientAcceptedAt ? this._fmtTime(clientAcceptedAt) : '',
      driverAcceptedStr: driverAcceptedAt ? this._fmtTime(driverAcceptedAt) : '',
      canAdvance
    })
    wx.setNavigationBarTitle({ title: 'Paida · ' + raw.number })
  },

  _shapeOrder(o) {
    const dest = [o.countryName, o.toCity].filter(Boolean).join(', ')
    const route = [o.fromCity, dest].filter(Boolean).join(' → ')
    return {
      id: o.id,
      number: o.number,
      status: o.status || 'new',
      createdAt: o.createdAt,
      route,
      client: [o.name, o.phone].filter(Boolean).join(' · '),
      clientWechat: o.wechat || '',
      goodsType: o.goodsType || '',
      weight: o.weight || '',
      volume: o.volume || '',
      price: o.price ? o.price.total : '',
      priceDays: o.price ? o.price.days : '',
      note: o.note || ''
    }
  },

  _statusLabel(s, t) {
    return ({
      new: t.status_new,
      taken: t.status_taken,
      released: t.status_released,
      loaded: t.status_loaded,
      in_transit: t.status_in_transit,
      at_border: t.status_at_border,
      delivered: t.status_delivered
    })[s] || s
  },

  _fmtTime(ts) {
    const d = new Date(ts || Date.now())
    const p = n => String(n).padStart(2, '0')
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`
  },

  acceptContract() {
    const now = Date.now()
    const patch = this.data.isClient
      ? { clientAcceptedAt: now }
      : { driverAcceptedAt: now }
    app.updateClientOrder(this.loadId, patch)
    this.refresh()
    wx.showToast({ title: this.data.t.contract_sig_toast, icon: 'success' })
  },

  callClient() {
    if (!this.data.clientPhone) return
    wx.makePhoneCall({
      phoneNumber: this.data.clientPhone,
      fail: () => wx.showToast({ title: '×', icon: 'none' })
    })
  },

  copyWechat() {
    const wc = this.data.load && this.data.load.clientWechat
    if (!wc) return
    wx.setClipboardData({
      data: wc,
      success: () => wx.showToast({ title: this.data.t.contract_wechat_toast })
    })
  },

  advance(e) {
    const t = this.data.t
    const newStatus = e.currentTarget.dataset.status
    const raw = app.getClientOrder(this.loadId)
    if (!raw) return
    const updatedHistory = (raw.history || []).concat([{ status: newStatus, at: Date.now() }])
    app.updateClientOrder(this.loadId, { status: newStatus, history: updatedHistory })
    this.refresh()
    wx.showToast({ title: t.status_update_success, icon: 'success' })
  }
})

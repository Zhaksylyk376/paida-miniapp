const app = getApp()
const i18n = require('../../utils/i18n.js')
const api = require('../../utils/api.js')

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
    load: null,
    driver: null,
    createdDate: '',
    statusLabel: '',
    historyLabeled: [],
    nextStatuses: [],
    clientPhone: ''
  },

  onLoad(query) {
    this.loadId = Number(query.id)
  },

  onShow() {
    this.refresh()
  },

  refresh() {
    const t = i18n.t(i18n.getLang())
    const loads = app.getDriverLoads()
    const load = loads.find(l => l.id === this.loadId)
    if (!load) {
      wx.showToast({ title: '×', icon: 'none' })
      setTimeout(() => wx.navigateBack(), 500)
      return
    }
    const driver = app.getDriverProfile()

    // Извлечь телефон из строки клиента (упрощённо: ищем + и цифры)
    const phoneMatch = (load.client || '').match(/\+?\d[\d\s\-()]{6,}/)
    const clientPhone = phoneMatch ? phoneMatch[0].replace(/\s/g, '') : ''

    const historyLabeled = (load.history || []).slice().reverse().map(h => ({
      label: this._statusLabel(h.status, t),
      timeStr: this._fmtTime(h.at)
    }))

    const nextStatuses = (STATUS_FLOW[load.status] || []).map(ns => ({
      value: ns.value,
      emoji: ns.emoji,
      label: this._statusLabel(ns.value, t)
    }))

    this.setData({
      t, load, driver,
      createdDate: this._fmtTime(load.createdAt),
      statusLabel: this._statusLabel(load.status, t),
      historyLabeled,
      nextStatuses,
      clientPhone
    })
    wx.setNavigationBarTitle({ title: 'Paida · ' + load.number })
  },

  _statusLabel(s, t) {
    return ({
      new: t.status_new, loaded: t.status_loaded, in_transit: t.status_in_transit,
      at_border: t.status_at_border, delivered: t.status_delivered
    })[s] || s
  },

  _fmtTime(ts) {
    const d = new Date(ts || Date.now())
    const p = n => String(n).padStart(2, '0')
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`
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
    const load = this.data.load
    const oldStatus = load.status

    const updatedHistory = (load.history || []).concat([{ status: newStatus, at: Date.now() }])
    const updated = app.updateDriverLoad(load.id, { status: newStatus, history: updatedHistory })

    this.refresh()
    wx.showToast({ title: t.status_update_success, icon: 'success' })

    api.sendStatusUpdate({ load: updated, driver: this.data.driver, oldStatus, newStatus })
      .catch(err => console.warn('[contract] Telegram send failed:', err))
  }
})

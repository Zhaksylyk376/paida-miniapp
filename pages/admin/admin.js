const app = getApp()
const i18n = require('../../utils/i18n.js')
const api = require('../../utils/api.js')

Page({
  data: {
    t: {},
    isAdmin: false,
    tab: 'pending',      // pending | approved | rejected
    drivers: [],
    loading: true
  },

  async onShow() {
    const s = await app.whenReady()
    const t = i18n.t(i18n.getLang())
    const isAdmin = !!(s && s.isAdmin)
    this.setData({ t, isAdmin })
    wx.setNavigationBarTitle({ title: t.nav_admin })
    if (isAdmin) this.refresh()
    else this.setData({ loading: false })
  },

  setTab(e) {
    this.setData({ tab: e.currentTarget.dataset.tab, loading: true })
    this.refresh()
  },

  async refresh() {
    const t = this.data.t
    try {
      const list = await api.adminDrivers(this.data.tab)
      const drivers = list.map(d => ({
        openid: d._openid,
        fullname: d.fullname,
        phone: d.phone,
        wechat: d.wechat,
        truck: d.truck,
        plate: d.plate,
        license: d.license,
        route: d.route,
        docs: d.docs || {},
        checks: d.checks || {},
        status: d.status,
        rejectReason: d.rejectReason || ''
      }))
      this.setData({ drivers, loading: false })
    } catch (e) {
      this.setData({ loading: false })
    }
  },

  previewDoc(e) {
    const url = e.currentTarget.dataset.url
    if (!url) return
    // fileID из облачного хранилища напрямую открывается в previewImage
    wx.previewImage({ current: url, urls: [url] })
  },

  approve(e) {
    this._review(e.currentTarget.dataset.openid, 'approve', '')
  },

  reject(e) {
    const openid = e.currentTarget.dataset.openid
    const t = this.data.t
    wx.showModal({
      title: t.admin_reject_reason,
      editable: true,
      placeholderText: t.admin_reject_reason,
      success: (r) => {
        if (r.confirm) this._review(openid, 'reject', r.content || '')
      }
    })
  },

  async _review(openid, decision, reason) {
    const t = this.data.t
    try {
      await api.adminReviewDriver(openid, decision, reason)
      wx.showToast({ title: t.admin_done, icon: 'success' })
      this.refresh()
    } catch (err) {
      wx.showToast({ title: (err && err.msg) || t.err_generic, icon: 'none' })
    }
  }
})

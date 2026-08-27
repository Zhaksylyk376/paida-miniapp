const app = getApp()
const i18n = require('../../utils/i18n.js')
const api = require('../../utils/api.js')

Page({
  data: {
    t: {},
    orderId: '',
    orderNumber: '',
    applications: [],
    loading: true
  },

  onLoad(query) {
    this.setData({ orderId: query.id })
  },

  async onShow() {
    await app.whenReady()
    const t = i18n.t(i18n.getLang())
    this.setData({ t })
    wx.setNavigationBarTitle({ title: t.nav_applications })
    this.refresh()
  },

  async refresh() {
    try {
      const res = await api.orderApplications(this.data.orderId)
      const t = this.data.t
      const apps = (res.applications || [])
        .filter(a => a.status !== 'rejected')
        .map(a => ({
          id: a._id,
          driverOpenid: a.driverOpenid,
          fullname: (a.driver && a.driver.fullname) || '—',
          truck: (a.driver && a.driver.truck) || '',
          plate: (a.driver && a.driver.plate) || '',
          wechat: (a.driver && a.driver.wechat) || '',
          ratingLabel: (a.driver && a.driver.rating)
            ? `${t.apps_rating}: ${a.driver.rating}` : t.apps_no_rating,
          message: a.message || '',
          chosen: a.status === 'chosen'
        }))
      this.setData({
        applications: apps,
        orderNumber: res.order ? res.order.number : '',
        loading: false
      })
      // Если водитель уже выбран — сразу к договору
      if (res.order && res.order.driverId) {
        wx.redirectTo({ url: `/pages/contract/contract?id=${this.data.orderId}&role=client` })
      }
    } catch (e) {
      this.setData({ loading: false })
    }
  },

  chooseDriver(e) {
    const driverOpenid = e.currentTarget.dataset.openid
    const t = this.data.t
    wx.showModal({
      title: '',
      content: t.apps_choose_confirm,
      confirmText: t.apps_choose,
      success: async (r) => {
        if (!r.confirm) return
        try {
          await api.orderChoose(this.data.orderId, driverOpenid)
          wx.showToast({ title: t.apps_chosen_toast, icon: 'success' })
          setTimeout(() => {
            wx.redirectTo({ url: `/pages/contract/contract?id=${this.data.orderId}&role=client` })
          }, 500)
        } catch (err) {
          wx.showToast({ title: (err && err.msg) || t.err_generic, icon: 'none' })
        }
      }
    })
  }
})

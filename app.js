const i18n = require('./utils/i18n.js')
const config = require('./utils/config.js')

// Единый ID «моего водителя» на устройстве — у нас одна анкета водителя на app install.
// Когда появится бэкенд — будет реальный driver_id.
const DEMO_DRIVER_ID = 1

App({
  onLaunch() {
    this.globalData.lang = i18n.getLang()
    this.globalData.role = i18n.getRole()
    setTimeout(() => i18n.applyTabBar(this.globalData.lang, this.globalData.role), 300)
  },

  onLangChange(lang) {
    this.globalData.lang = lang
    i18n.setLang(lang)
  },

  onRoleChange(role) {
    this.globalData.role = role
    i18n.setRole(role)
  },

  // ---------- ORDERS (единый источник для клиента и водителя) ----------
  getClientOrders() {
    return wx.getStorageSync('client_orders') || []
  },
  setClientOrders(orders) {
    wx.setStorageSync('client_orders', orders)
  },
  addClientOrder(order) {
    const orders = this.getClientOrders()
    orders.unshift(order)
    this.setClientOrders(orders)
    return order
  },
  getClientOrder(id) {
    return this.getClientOrders().find(o => o.id === Number(id)) || null
  },
  updateClientOrder(id, patch) {
    const orders = this.getClientOrders()
    const idx = orders.findIndex(o => o.id === Number(id))
    if (idx === -1) return null
    orders[idx] = Object.assign({}, orders[idx], patch)
    this.setClientOrders(orders)
    return orders[idx]
  },

  // Открытые заявки — status=new и никем не взяты
  getAvailableOrders() {
    return this.getClientOrders().filter(o => o.status === 'new' && !o.driverId)
  },

  // Рейсы «моего» водителя
  getMyDriverOrders() {
    return this.getClientOrders().filter(o => o.driverId === DEMO_DRIVER_ID)
  },

  // Водитель берёт заявку
  takeOrder(id) {
    const now = Date.now()
    return this.updateClientOrder(id, {
      driverId: DEMO_DRIVER_ID,
      takenAt: now,
      status: 'taken',
      history: (this.getClientOrder(id) && this.getClientOrder(id).history || [])
                 .concat([{ status: 'taken', at: now }])
    })
  },

  // Водитель отказывается от рейса (пока не поехал)
  releaseOrder(id) {
    const now = Date.now()
    return this.updateClientOrder(id, {
      driverId: null,
      takenAt: null,
      status: 'new',
      history: (this.getClientOrder(id) && this.getClientOrder(id).history || [])
                 .concat([{ status: 'released', at: now }])
    })
  },

  DEMO_DRIVER_ID,

  // ---------- DRIVER PROFILE ----------
  getDriverProfile() {
    return wx.getStorageSync('driver_profile') || null
  },
  setDriverProfile(profile) {
    wx.setStorageSync('driver_profile', profile)
  },
  clearDriverProfile() {
    wx.removeStorageSync('driver_profile')
  },

  globalData: {
    lang: 'zh',
    role: 'client',
    brand: config.BRAND
  }
})

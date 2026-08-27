const app = getApp()
const i18n = require('../../utils/i18n.js')

Page({
  data: {
    t: {},
    form: {
      fullname: '', phone: '', wechat: '',
      truck: '', plate: '', license: '', route: ''
    },
    loading: false,
    editMode: false
  },

  onLoad(query) {
    this.setData({ editMode: query && query.edit === '1' })
    // Если редактируем — подтянем сохранённый профиль
    if (this.data.editMode) {
      const existing = app.getDriverProfile()
      if (existing) this.setData({ form: Object.assign({}, this.data.form, existing) })
    }
  },

  onShow() {
    const lang = i18n.getLang()
    const t = i18n.t(lang)
    this.setData({ t })
    wx.setNavigationBarTitle({ title: t.nav_d_register })
  },

  onInput(e) {
    const field = e.currentTarget.dataset.field
    this.setData({ [`form.${field}`]: e.detail.value })
  },

  submit() {
    const t = this.data.t
    const { fullname, phone, truck, plate } = this.data.form
    if (!fullname || !phone || !truck || !plate) {
      wx.showToast({ title: t.order_toast_required, icon: 'none' })
      return
    }
    if (!/^\+?\d{7,15}$/.test(phone)) {
      wx.showToast({ title: t.order_toast_phone, icon: 'none' })
      return
    }

    const profile = Object.assign({}, this.data.form, {
      status: 'pending',
      registeredAt: Date.now()
    })
    app.setDriverProfile(profile)

    wx.showModal({
      title: t.d_reg_success_title,
      content: t.d_reg_success_msg,
      showCancel: false,
      confirmText: t.d_reg_ok,
      success: () => wx.switchTab({ url: '/pages/index/index' })
    })
  }
})

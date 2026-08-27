const app = getApp()
const i18n = require('../../utils/i18n.js')
const api = require('../../utils/api.js')

Page({
  data: {
    t: {},
    form: {
      fullname: '', phone: '', wechat: '',
      truck: '', plate: '', license: '', route: ''
    },
    // Локальные превью (tempFilePath) и загруженные fileID
    docs: {
      techpassport: { preview: '', fileID: '' },
      driverlicense: { preview: '', fileID: '' },
      carphoto: { preview: '', fileID: '' }
    },
    loading: false,
    editMode: false
  },

  onLoad(query) {
    this.setData({ editMode: !!(query && query.edit === '1') })
  },

  async onShow() {
    const lang = i18n.getLang()
    const t = i18n.t(lang)
    this.setData({ t })
    wx.setNavigationBarTitle({ title: t.nav_d_register })

    // Если редактируем — подтянуть сохранённую анкету
    if (this.data.editMode) {
      try {
        const drv = await api.driverGet()
        if (drv) {
          this.setData({
            form: {
              fullname: drv.fullname || '', phone: drv.phone || '',
              wechat: drv.wechat || '', truck: drv.truck || '',
              plate: drv.plate || '', license: drv.license || '',
              route: drv.route || ''
            },
            'docs.techpassport.fileID': (drv.docs && drv.docs.techpassport) || '',
            'docs.driverlicense.fileID': (drv.docs && drv.docs.driverlicense) || '',
            'docs.carphoto.fileID': (drv.docs && drv.docs.carphoto) || ''
          })
        }
      } catch (e) { /* тихо */ }
    }
  },

  onInput(e) {
    const field = e.currentTarget.dataset.field
    this.setData({ [`form.${field}`]: e.detail.value })
  },

  // Выбор и загрузка документа
  chooseDoc(e) {
    const key = e.currentTarget.dataset.key
    const t = this.data.t
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: async (res) => {
        const tempPath = res.tempFiles[0].tempFilePath
        this.setData({ [`docs.${key}.preview`]: tempPath })
        try {
          wx.showLoading({ title: t.d_doc_upload, mask: true })
          const fileID = await api.uploadFile(tempPath, 'driver-docs')
          this.setData({ [`docs.${key}.fileID`]: fileID })
          wx.hideLoading()
        } catch (err) {
          wx.hideLoading()
          this.setData({ [`docs.${key}.preview`]: '' })
          wx.showToast({ title: this._err(err), icon: 'none' })
        }
      }
    })
  },

  async submit() {
    if (this.data.loading) return
    const t = this.data.t
    const { fullname, phone, truck, plate } = this.data.form

    // Клиентская проверка перед отправкой (сервер проверит ещё раз)
    if (!fullname || !phone || !truck || !plate) {
      wx.showToast({ title: t.order_toast_required, icon: 'none' }); return
    }
    if (!/^\+?\d{7,15}$/.test(phone)) {
      wx.showToast({ title: t.order_toast_phone, icon: 'none' }); return
    }
    const d = this.data.docs
    if (!d.techpassport.fileID || !d.driverlicense.fileID || !d.carphoto.fileID) {
      wx.showToast({ title: t.d_reg_docs_hint, icon: 'none' }); return
    }

    this.setData({ loading: true })
    wx.showLoading({ title: t.d_reg_checking, mask: true })
    try {
      await api.driverRegister(this.data.form, {
        techpassport: d.techpassport.fileID,
        driverlicense: d.driverlicense.fileID,
        carphoto: d.carphoto.fileID
      })
      wx.hideLoading()
      this.setData({ loading: false })
      app.onRoleChange('driver')
      if (app.globalData.session) app.globalData.session.driverStatus = 'pending'

      wx.showModal({
        title: t.d_reg_success_title,
        content: t.d_reg_success_msg,
        showCancel: false,
        confirmText: t.d_reg_ok,
        success: () => wx.switchTab({ url: '/pages/index/index' })
      })
    } catch (err) {
      wx.hideLoading()
      this.setData({ loading: false })
      wx.showToast({ title: this._err(err), icon: 'none', duration: 2500 })
    }
  },

  // Перевод кода ошибки сервера в понятный текст
  _err(err) {
    const t = this.data.t
    const code = (err && err.code) || 'generic'
    return t['err_' + code] || (err && err.msg) || t.err_generic
  }
})

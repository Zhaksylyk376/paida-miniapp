const app = getApp()
const i18n = require('../../utils/i18n.js')
const api = require('../../utils/api.js')

const COUNTRIES = ['cn', 'kz']
const TYPES = ['physical', 'legal']

Page({
  data: {
    t: {},
    form: {
      country: 'cn',
      type: 'physical',
      name: '',
      idNumber: ''
    },
    doc: { preview: '', fileID: '' },
    countryIndex: 0,
    typeIndex: 0,
    countryLabels: [],
    typeLabels: [],
    idFieldLabel: '',
    nameFieldLabel: '',
    docHint: '',
    kyc: null,
    statusLabel: '',
    loading: false
  },

  async onShow() {
    const lang = i18n.getLang()
    const t = i18n.t(lang)
    wx.setNavigationBarTitle({ title: t.nav_kyc })

    const countryLabels = [t.kyc_country_cn, t.kyc_country_kz]
    const typeLabels = [t.kyc_type_physical, t.kyc_type_legal]
    this.setData({ t, countryLabels, typeLabels })
    this._recomputeLabels()

    try {
      const kyc = await api.clientKycGet()
      if (kyc) {
        this.setData({
          kyc,
          statusLabel: t['kyc_status_' + kyc.status] || '',
          countryIndex: COUNTRIES.indexOf(kyc.country),
          typeIndex: TYPES.indexOf(kyc.type),
          form: {
            country: kyc.country,
            type: kyc.type,
            name: kyc.name || '',
            idNumber: kyc.idNumber || ''
          },
          'doc.fileID': kyc.docFileID || ''
        })
        this._recomputeLabels()
      }
    } catch (e) { /* тихо */ }
  },

  _recomputeLabels() {
    const t = this.data.t
    const c = this.data.form.country
    const y = this.data.form.type
    this.setData({
      idFieldLabel: t['kyc_field_id_' + c + '_' + y] || '',
      nameFieldLabel: t['kyc_field_name_' + y] || '',
      docHint: t['kyc_doc_hint_' + c + '_' + y] || ''
    })
  },

  onCountry(e) {
    const idx = +e.detail.value
    this.setData({
      countryIndex: idx,
      'form.country': COUNTRIES[idx],
      'form.idNumber': ''
    })
    this._recomputeLabels()
  },

  onType(e) {
    const idx = +e.detail.value
    this.setData({
      typeIndex: idx,
      'form.type': TYPES[idx],
      'form.idNumber': '',
      'form.name': ''
    })
    this._recomputeLabels()
  },

  onInput(e) {
    const field = e.currentTarget.dataset.field
    this.setData({ [`form.${field}`]: e.detail.value })
  },

  chooseDoc() {
    const t = this.data.t
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: async (res) => {
        const tempPath = res.tempFiles[0].tempFilePath
        this.setData({ 'doc.preview': tempPath })
        try {
          wx.showLoading({ title: t.d_doc_upload, mask: true })
          const fileID = await api.uploadFile(tempPath, 'client-kyc')
          this.setData({ 'doc.fileID': fileID })
          wx.hideLoading()
        } catch (err) {
          wx.hideLoading()
          this.setData({ 'doc.preview': '' })
          wx.showToast({ title: this._err(err), icon: 'none' })
        }
      }
    })
  },

  async submit() {
    if (this.data.loading) return
    const t = this.data.t
    const { name, idNumber } = this.data.form
    if (!name || name.length < 2) {
      wx.showToast({ title: t.err_BAD_NAME, icon: 'none' }); return
    }
    if (!idNumber) {
      wx.showToast({ title: t.err_BAD_ID, icon: 'none' }); return
    }
    if (!this.data.doc.fileID) {
      wx.showToast({ title: t.err_DOC_REQUIRED, icon: 'none' }); return
    }

    this.setData({ loading: true })
    wx.showLoading({ title: t.d_reg_checking, mask: true })
    try {
      await api.clientKycSubmit(this.data.form, this.data.doc.fileID)
      wx.hideLoading()
      this.setData({ loading: false })
      if (app.globalData.session) app.globalData.session.kycStatus = 'submitted'
      wx.showModal({
        title: t.kyc_success_title,
        content: t.kyc_success_msg,
        showCancel: false,
        confirmText: t.d_reg_ok || 'OK',
        success: () => wx.navigateBack()
      })
    } catch (err) {
      wx.hideLoading()
      this.setData({ loading: false })
      wx.showToast({ title: this._err(err), icon: 'none', duration: 2500 })
    }
  },

  _err(err) {
    const t = this.data.t
    const code = (err && err.code) || 'generic'
    return t['err_' + code] || (err && err.msg) || t.err_generic
  }
})

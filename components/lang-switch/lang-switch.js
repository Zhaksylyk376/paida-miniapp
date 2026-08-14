const i18n = require('../../utils/i18n.js')
const app = getApp()

Component({
  data: {
    lang: 'zh'
  },

  lifetimes: {
    attached() {
      this.setData({ lang: i18n.getLang() })
    }
  },

  pageLifetimes: {
    show() {
      this.setData({ lang: i18n.getLang() })
    }
  },

  methods: {
    pick(e) {
      const lang = e.currentTarget.dataset.lang
      if (lang === this.data.lang) return
      app.onLangChange(lang)
      this.setData({ lang })
      // Уведомляем страницу, чтобы она перерисовалась
      this.triggerEvent('change', { lang })
    }
  }
})

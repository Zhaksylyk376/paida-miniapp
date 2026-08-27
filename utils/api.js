// ============================================================
//  API — тонкая обёртка над Paida REST-бэкендом (Cloudflare Worker).
//
//  Все обращения идут одним POST'ом с полем `action` — как раньше
//  было в облачной функции WeChat. Токен устройства = uuid из
//  wx.setStorageSync, передаётся в заголовке `Authorization: Bearer`.
//
//  Демо-режим: если API_BASE пустой или запрос упал по сети —
//  api возвращает пустые дефолты и не бьёт по красным ошибкам.
// ============================================================

// ⚠️ ВПИШИ СЮДА адрес своего задеплоенного Worker'а.
// Обычно вида https://paida-api.<твой-worker-subdomain>.workers.dev
// или (если привязал свой домен) https://api.paida.com
const API_BASE = 'https://paida-api.paida.workers.dev'

const TOKEN_KEY = 'paida_device_token'
// Фиксированный uuid владельца — становится админом автоматически.
// Убери / поставь false при публикации, если не хочешь чтобы все были админами.
const OWNER_TOKEN = 'a1b2c3d4-e5f6-4890-9012-345678901234'
let _demo = false

// Дефолты для демо-режима и сетевых сбоев
const DEMO_DEFAULTS = {
  whoami:            { openid: 'demo', isAdmin: false },
  login:             { openid: 'demo', isAdmin: false, role: 'client', driverStatus: null, kycStatus: null },
  driverGet:         null,
  clientKycGet:      null,
  myOrders:          [],
  myLoads:           [],
  availableOrders:   [],
  orderApplications: { order: null, applications: [] },
  adminDrivers:      [],
  orderGet:          { order: null, driver: null }
}
const isReadOnly = (action) => DEMO_DEFAULTS.hasOwnProperty(action)
const demoResult = (action) => isReadOnly(action) ? DEMO_DEFAULTS[action] : null

function ensureToken() {
  if (OWNER_TOKEN) {
    wx.setStorageSync(TOKEN_KEY, OWNER_TOKEN)
    return OWNER_TOKEN
  }
  let t = wx.getStorageSync(TOKEN_KEY)
  if (!t) {
    t = _uuid()
    wx.setStorageSync(TOKEN_KEY, t)
  }
  return t
}

function _uuid() {
  // Простой RFC-4122 v4 uuid — Math.random для WeChat mini-program достаточно.
  const s = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'
  return s.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

function call(action, payload) {
  if (_demo || !API_BASE) {
    if (isReadOnly(action)) return Promise.resolve(demoResult(action))
    return Promise.reject({ code: 'DEMO', msg: 'Демо-режим · сервер не подключён' })
  }
  const token = ensureToken()
  return new Promise((resolve, reject) => {
    wx.request({
      url: `${API_BASE}/api/paida`,
      method: 'POST',
      header: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      data: Object.assign({ action }, payload || {}),
      success: (res) => {
        const r = res.data || {}
        if (r.ok) resolve(r.data)
        else reject({ code: r.code || 'ERR', msg: r.msg || 'Ошибка' })
      },
      fail: (err) => {
        console.error('[api] request fail', action, err)
        if (isReadOnly(action)) return resolve(demoResult(action))
        reject({ code: 'NETWORK', msg: 'Нет связи с сервером' })
      }
    })
  })
}

// Загрузка файла (документа/фото) через multipart POST в /api/upload.
// Возвращает fileID (ключ в R2), который потом отдаём в action'ы (KYC, driver).
function uploadFile(tempFilePath, folder) {
  if (_demo || !API_BASE) {
    return Promise.reject({ code: 'DEMO', msg: 'Демо-режим · загрузка файлов недоступна' })
  }
  const token = ensureToken()
  return new Promise((resolve, reject) => {
    wx.uploadFile({
      url: `${API_BASE}/api/upload`,
      filePath: tempFilePath,
      name: 'file',
      header: { 'Authorization': `Bearer ${token}` },
      formData: { folder: folder || 'misc' },
      success: (res) => {
        try {
          const r = JSON.parse(res.data)
          if (r.ok) resolve(r.data.fileID)
          else reject({ code: r.code || 'UPLOAD', msg: r.msg || 'Ошибка загрузки' })
        } catch (e) {
          reject({ code: 'UPLOAD', msg: 'Некорректный ответ сервера' })
        }
      },
      fail: (err) => {
        console.error('[api] uploadFile fail', err)
        reject({ code: 'UPLOAD', msg: 'Не удалось загрузить файл' })
      }
    })
  })
}

// Полный URL к файлу в R2 — можно вставлять в <image src>
function fileURL(fileID) {
  if (!fileID) return ''
  if (fileID.startsWith('http')) return fileID
  if (!API_BASE) return ''
  return `${API_BASE}/uploads/${fileID}`
}

module.exports = {
  call,
  uploadFile,
  fileURL,
  ensureToken,
  _setDemo: (v) => { _demo = !!v },
  isDemo:   () => _demo || !API_BASE,
  apiBase:  () => API_BASE,

  // Сессия / роль
  whoami:      ()               => call('whoami'),
  login:       ()               => call('login'),

  // Водитель
  driverGet:   ()               => call('driverGet'),
  driverRegister: (form, docs)  => call('driverRegister', { form, docs }),

  // KYC клиента (身份证/营业执照/ИИН/БИН)
  clientKycGet:    ()               => call('clientKycGet'),
  clientKycSubmit: (form, docFileID) => call('clientKycSubmit', { form, docFileID }),

  // Заказы — клиент
  orderCreate: (form)           => call('orderCreate', { form }),
  myOrders:    ()               => call('myOrders'),
  orderGet:    (orderId)        => call('orderGet', { orderId }),

  // Заказы — водитель
  availableOrders: ()           => call('availableOrders'),
  orderApply:  (orderId, message) => call('orderApply', { orderId, message }),
  myLoads:     ()               => call('myLoads'),

  // Отклики / выбор
  orderApplications: (orderId)  => call('orderApplications', { orderId }),
  orderChoose: (orderId, driverOpenid) => call('orderChoose', { orderId, driverOpenid }),

  // Договор / статусы
  contractAccept: (orderId)     => call('contractAccept', { orderId }),
  orderAdvance: (orderId, status) => call('orderAdvance', { orderId, status }),

  // Админ
  adminDrivers: (status)        => call('adminDrivers', { status }),
  adminReviewDriver: (driverOpenid, decision, reason) =>
                                   call('adminReviewDriver', { driverOpenid, decision, reason })
}

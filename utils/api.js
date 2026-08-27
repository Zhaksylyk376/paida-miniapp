// ============================================================
//  API — тонкая обёртка над облачной функцией «paida».
//
//  Демо-режим: если облако не настроено (cloudEnv не заполнен),
//  api не бьётся об сервер, а возвращает разумные пустые дефолты.
//  Это позволяет запускать UI на test-AppID без облачных прав.
// ============================================================

let _demo = false

// Дефолтные значения на каждый action в демо-режиме
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

function _demoResult(action) {
  return DEMO_DEFAULTS.hasOwnProperty(action) ? DEMO_DEFAULTS[action] : null
}

function call(action, payload) {
  if (_demo) {
    // В демо-режиме мутирующие действия отклоняем, чтобы UI показал toast
    const readOnly = DEMO_DEFAULTS.hasOwnProperty(action)
    if (readOnly) return Promise.resolve(_demoResult(action))
    return Promise.reject({ code: 'DEMO', msg: 'Демо-режим · сервер не подключён' })
  }
  return new Promise((resolve, reject) => {
    wx.cloud.callFunction({
      name: 'paida',
      data: Object.assign({ action }, payload || {}),
      success: (res) => {
        const r = res.result || {}
        if (r.ok) resolve(r.data)
        else reject({ code: r.code || 'ERR', msg: r.msg || 'Ошибка' })
      },
      fail: (err) => {
        console.error('[api] callFunction fail', action, err)
        reject({ code: 'NETWORK', msg: 'Нет связи с сервером' })
      }
    })
  })
}

// Загрузка файла (документа/фото) в облачное хранилище.
function uploadFile(tempFilePath, folder) {
  if (_demo) {
    return Promise.reject({ code: 'DEMO', msg: 'Демо-режим · загрузка файлов недоступна' })
  }
  const ext = (tempFilePath.match(/\.\w+$/) || ['.jpg'])[0]
  const rand = Math.floor(Math.random() * 1e9)
  const cloudPath = `${folder}/${Date.now()}_${rand}${ext}`
  return new Promise((resolve, reject) => {
    wx.cloud.uploadFile({
      cloudPath,
      filePath: tempFilePath,
      success: (res) => resolve(res.fileID),
      fail: (err) => {
        console.error('[api] uploadFile fail', err)
        reject({ code: 'UPLOAD', msg: 'Не удалось загрузить файл' })
      }
    })
  })
}

module.exports = {
  call,
  uploadFile,
  _setDemo: (v) => { _demo = !!v },
  isDemo:   () => _demo,

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

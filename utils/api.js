// ============================================================
//  API — тонкая обёртка над облачной функцией «paida».
//  Все обращения к серверу идут отсюда. Возвращает Promise с data
//  или бросает ошибку { code, msg } — её удобно ловить в try/catch.
// ============================================================

function call(action, payload) {
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
// Возвращает fileID, который потом сохраняем в анкете.
function uploadFile(tempFilePath, folder) {
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

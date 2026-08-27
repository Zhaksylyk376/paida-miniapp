// ============================================================
//  PAIDA — облачная функция-роутер
//  Одна функция обслуживает все действия приложения.
//  Вызов с клиента: wx.cloud.callFunction({ name:'paida', data:{ action:'...', ... } })
//  Каждый вызов уже содержит проверенный WeChat openid — подделать его нельзя.
// ============================================================

const cloud = require('wx-server-sdk')
const crypto = require('crypto')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()
const _ = db.command
const $ = db.command.aggregate

// Версия текста договора: при изменении оговорок/арбитража поднимаем — старые
// подписи остаются валидными для той версии, новые фиксируются как v2 и т.д.
const CONTRACT_VERSION = 'paida-v1-2026-08'

// Коллекции
const Users    = db.collection('users')     // профиль + роль
const Drivers  = db.collection('drivers')    // анкеты водителей + документы + проверки
const Orders   = db.collection('orders')     // заказы клиентов
const Apps     = db.collection('applications') // отклики водителей на заказы

// ------------------------------------------------------------
//  СПИСОК АДМИНОВ. Впиши сюда openid тех, кто может одобрять водителей.
//  Свой openid узнаешь так: зайди в приложение, вызови action 'whoami' —
//  он вернёт твой openid, скопируй его сюда и передеплой функцию.
// ------------------------------------------------------------
const ADMINS = [
  // 'oXXXXXXXXXXXXXXXXXXXXXXXXXXX'
]

// ============================================================
//  ВСПОМОГАТЕЛЬНОЕ
// ============================================================
function ok(data)      { return { ok: true, data: data === undefined ? null : data } }
function fail(code, msg) { return { ok: false, code, msg: msg || code } }
function now()         { return Date.now() }
function isAdmin(openid) { return ADMINS.indexOf(openid) !== -1 }

const PHONE_RE = /^\+?\d{7,15}$/

function genOrderNumber() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let s = ''
  for (let i = 0; i < 4; i++) s += chars[Math.floor(Math.random() * chars.length)]
  return 'PAIDA-' + s
}

// Нормализация госномера для сравнения (убираем пробелы/регистр)
function normPlate(p) {
  return String(p || '').toUpperCase().replace(/[\s\-]/g, '')
}

// ============================================================
//  ТОЧКА ВХОДА
// ============================================================
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID
  const action = event.action

  try {
    switch (action) {
      case 'whoami':            return ok({ openid, isAdmin: isAdmin(openid) })
      case 'login':             return await login(openid, event)

      // Водитель
      case 'driverGet':         return await driverGet(openid)
      case 'driverRegister':    return await driverRegister(openid, event)

      // KYC клиента (身份证/营业执照/ИИН/БИН)
      case 'clientKycGet':      return await clientKycGet(openid)
      case 'clientKycSubmit':   return await clientKycSubmit(openid, event)

      // Заказы (клиент)
      case 'orderCreate':       return await orderCreate(openid, event)
      case 'myOrders':          return await myOrders(openid)
      case 'orderGet':          return await orderGet(openid, event)

      // Заказы (водитель)
      case 'availableOrders':   return await availableOrders(openid)
      case 'orderApply':        return await orderApply(openid, event)
      case 'myLoads':           return await myLoads(openid)

      // Отклики / выбор
      case 'orderApplications': return await orderApplications(openid, event)
      case 'orderChoose':       return await orderChoose(openid, event)

      // Договор и статусы
      case 'contractAccept':    return await contractAccept(openid, event)
      case 'orderAdvance':      return await orderAdvance(openid, event)

      // Админ
      case 'adminDrivers':      return await adminDrivers(openid, event)
      case 'adminReviewDriver': return await adminReviewDriver(openid, event)

      default:
        return fail('UNKNOWN_ACTION', 'Неизвестное действие: ' + action)
    }
  } catch (e) {
    console.error('[paida] error in', action, e)
    return fail('SERVER_ERROR', (e && e.message) || 'server error')
  }
}

// ============================================================
//  KYC клиента — верификация 身份证 / 营业执照 (КНР) или ИИН / БИН (КЗ)
//  Требуется по концепции клиента: для юридической силы электронного договора
//  каждая сторона должна быть идентифицирована. Хранится в users.kyc.
// ============================================================

// Форматы ID:
//   cn.physical — 身份证: 18 знаков, последний может быть X
//   cn.legal    — 营业执照 (USCC): 18 буквенно-цифровых знаков
//   kz.physical — ИИН: 12 цифр
//   kz.legal    — БИН: 12 цифр (структурно как ИИН)
const ID_RE = {
  'cn.physical': /^\d{17}[\dXx]$/,
  'cn.legal':    /^[0-9A-Za-z]{18}$/,
  'kz.physical': /^\d{12}$/,
  'kz.legal':    /^\d{12}$/
}

function normId(s) {
  return String(s || '').toUpperCase().replace(/\s+/g, '')
}

async function clientKycGet(openid) {
  const u = await Users.where({ _openid: openid }).get()
  const user = u.data[0]
  return ok(user && user.kyc ? user.kyc : null)
}

async function clientKycSubmit(openid, event) {
  const form = event.form || {}
  const docFileID = event.docFileID || ''

  const type    = form.type    // 'physical' | 'legal'
  const country = form.country // 'cn' | 'kz'
  const key = `${country}.${type}`
  const re = ID_RE[key]
  if (!re) return fail('VALIDATION', 'Неверная страна или тип')

  const idNumber = normId(form.idNumber)
  if (!re.test(idNumber)) return fail('BAD_ID', 'Формат идентификатора не совпадает с выбранным типом')

  const name = String(form.name || '').trim()
  if (name.length < 2) return fail('BAD_NAME', 'Укажите ФИО или наименование')

  if (!docFileID) return fail('DOC_REQUIRED', 'Загрузите фото документа')

  // Антифрод: один и тот же документ не может числиться за разными openid
  const dup = await Users.where({
    'kyc.idNumberKey': key + ':' + idNumber,
    _openid: _.neq(openid)
  }).count()
  if (dup.total > 0) return fail('DUP_ID', 'Этот идентификатор уже зарегистрирован другим пользователем')

  const kyc = {
    type, country,
    name,
    idNumber,
    idNumberKey: key + ':' + idNumber, // индекс для антифрода
    docFileID,
    status: 'submitted', // MVP: submitted достаточно для подписи, admin верификация — отдельным флоу
    submittedAt: now(),
    reviewedAt: null,
    reviewedBy: null,
    rejectReason: ''
  }

  const u = await Users.where({ _openid: openid }).get()
  if (u.data.length) {
    await Users.doc(u.data[0]._id).update({ data: { kyc } })
  } else {
    await Users.add({ data: { _openid: openid, role: 'client', createdAt: now(), kyc } })
  }
  return ok(kyc)
}

async function requireClientKyc(openid) {
  const u = await Users.where({ _openid: openid }).get()
  const user = u.data[0]
  if (!user || !user.kyc || !user.kyc.status) return { ok: false }
  // MVP: любой submitted/approved пропускает; rejected блокирует
  if (user.kyc.status === 'rejected') return { ok: false, rejected: true, reason: user.kyc.rejectReason }
  return { ok: true, kyc: user.kyc }
}

// ============================================================
//  LOGIN — гарантируем документ пользователя и возвращаем его состояние
// ============================================================
async function login(openid, event) {
  const found = await Users.where({ _openid: openid }).get()
  let user
  if (found.data.length === 0) {
    const doc = {
      _openid: openid,
      role: 'client',
      createdAt: now()
    }
    await Users.add({ data: doc })
    user = doc
  } else {
    user = found.data[0]
  }

  // Есть ли анкета водителя и в каком она статусе
  const drv = await Drivers.where({ _openid: openid }).get()
  const driver = drv.data[0] || null

  return ok({
    openid,
    isAdmin: isAdmin(openid),
    role: user.role || 'client',
    driverStatus: driver ? driver.status : null, // null | pending | approved | rejected
    kycStatus: (user.kyc && user.kyc.status) || null // null | submitted | approved | rejected
  })
}

// ============================================================
//  ВОДИТЕЛЬ: получить свою анкету
// ============================================================
async function driverGet(openid) {
  const drv = await Drivers.where({ _openid: openid }).get()
  return ok(drv.data[0] || null)
}

// ============================================================
//  ВОДИТЕЛЬ: регистрация с документами + автопроверки
//  event.form  = { fullname, phone, wechat, truck, plate, license, route }
//  event.docs  = { techpassport, driverlicense, carphoto }  (fileID из облачного хранилища)
// ============================================================
async function driverRegister(openid, event) {
  const form = event.form || {}
  const docs = event.docs || {}

  // ---------- АВТОПРОВЕРКА 1: обязательные поля и формат ----------
  const problems = []
  if (!form.fullname || String(form.fullname).trim().length < 2) problems.push('FULLNAME')
  if (!PHONE_RE.test(form.phone || '')) problems.push('PHONE')
  if (!form.truck || String(form.truck).trim().length < 2) problems.push('TRUCK')
  if (!normPlate(form.plate)) problems.push('PLATE')

  // ---------- АВТОПРОВЕРКА 2: комплектность документов ----------
  if (!docs.techpassport)  problems.push('DOC_TECHPASSPORT')
  if (!docs.driverlicense) problems.push('DOC_LICENSE')
  if (!docs.carphoto)      problems.push('DOC_CARPHOTO')

  if (problems.length) {
    return fail('VALIDATION', 'Проверьте поля и документы')
  }

  const plateNorm = normPlate(form.plate)
  const phone = String(form.phone).trim()

  // ---------- АВТОПРОВЕРКА 3: дубликаты (антифрод) ----------
  // Один и тот же госномер / телефон, уже зарегистрированный ДРУГИМ пользователем —
  // типичный признак поддельной анкеты.
  const dupPlate = await Drivers.where({
    plateNorm: plateNorm,
    _openid: _.neq(openid)
  }).count()
  if (dupPlate.total > 0) {
    return fail('DUP_PLATE', 'Этот госномер уже зарегистрирован другим водителем')
  }

  const dupPhone = await Drivers.where({
    phone: phone,
    _openid: _.neq(openid)
  }).count()
  if (dupPhone.total > 0) {
    return fail('DUP_PHONE', 'Этот телефон уже зарегистрирован другим водителем')
  }

  // Результаты автопроверок сохраняем — админ их видит
  const checks = {
    fieldsValid: true,
    docsComplete: true,
    plateUnique: true,
    phoneUnique: true,
    // Место для будущей внешней проверки (OCR техпаспорта, база угонов и т.п.)
    externalVerified: false,
    checkedAt: now()
  }

  const record = {
    fullname: String(form.fullname).trim(),
    phone: phone,
    wechat: String(form.wechat || '').trim(),
    truck: String(form.truck).trim(),
    plate: String(form.plate).trim(),
    plateNorm: plateNorm,
    license: String(form.license || '').trim(),
    route: String(form.route || '').trim(),
    docs: {
      techpassport: docs.techpassport,
      driverlicense: docs.driverlicense,
      carphoto: docs.carphoto
    },
    checks,
    status: 'pending',      // pending → approved / rejected (решает админ)
    rating: null,
    rejectReason: '',
    registeredAt: now(),
    reviewedAt: null
  }

  // upsert: если водитель повторно подаёт — обновляем его же анкету
  const existing = await Drivers.where({ _openid: openid }).get()
  if (existing.data.length) {
    await Drivers.doc(existing.data[0]._id).update({
      data: Object.assign({}, record, { status: 'pending', reviewedAt: null, rejectReason: '' })
    })
  } else {
    await Drivers.add({ data: Object.assign({ _openid: openid }, record) })
  }

  // Ставим роль driver
  await setRole(openid, 'driver')

  return ok({ status: 'pending' })
}

async function setRole(openid, role) {
  const u = await Users.where({ _openid: openid }).get()
  if (u.data.length) await Users.doc(u.data[0]._id).update({ data: { role } })
  else await Users.add({ data: { _openid: openid, role, createdAt: now() } })
}

// Проверка: одобренный ли водитель (нужно перед откликом)
async function requireApprovedDriver(openid) {
  const drv = await Drivers.where({ _openid: openid }).get()
  const d = drv.data[0]
  if (!d) return { ok: false, reason: 'NO_PROFILE' }
  if (d.status !== 'approved') return { ok: false, reason: 'NOT_APPROVED', status: d.status }
  return { ok: true, driver: d }
}

// ============================================================
//  КЛИЕНТ: создать заказ
// ============================================================
async function orderCreate(openid, event) {
  const f = event.form || {}
  if (!f.countryCode || !f.name || !PHONE_RE.test(f.phone || '')) {
    return fail('VALIDATION', 'Проверьте страну, имя и телефон')
  }
  if (!f.weight && !f.volume) {
    return fail('VALIDATION', 'Укажите вес или объём')
  }

  const doc = {
    _openid: openid,          // клиент
    number: genOrderNumber(),
    fromCity: f.fromCity || '',
    countryCode: f.countryCode,
    countryName: f.countryName || '',
    borderCode: f.borderCode || '',
    borderName: f.borderName || '',
    toCity: f.toCity || '',
    goodsType: f.goodsType || '',
    weight: f.weight || '',
    volume: f.volume || '',
    name: f.name,
    phone: f.phone,
    wechat: f.wechat || '',
    note: f.note || '',
    price: f.price || null,
    route: event.route || null,  // { totalKm, queueHours, etaDays, borderCoords, ... }
    status: 'new',            // new → taken → loaded → in_transit → at_border → delivered
    driverId: null,           // openid выбранного водителя
    appsCount: 0,             // сколько откликов
    clientAcceptedAt: 0,
    driverAcceptedAt: 0,
    history: [{ status: 'new', at: now() }],
    createdAt: now()
  }
  const res = await Orders.add({ data: doc })
  return ok({ _id: res._id, number: doc.number })
}

// Клиент: мои заказы
async function myOrders(openid) {
  const res = await Orders.where({ _openid: openid })
    .orderBy('createdAt', 'desc').get()
  return ok(res.data)
}

// Получить один заказ (клиент-владелец, назначенный водитель или админ)
async function orderGet(openid, event) {
  const id = event.orderId
  const doc = await Orders.doc(id).get().catch(() => null)
  if (!doc || !doc.data) return fail('NOT_FOUND', 'Заказ не найден')
  const o = doc.data
  const allowed = o._openid === openid || o.driverId === openid || isAdmin(openid)
  if (!allowed) return fail('FORBIDDEN', 'Нет доступа к заказу')

  // Приложим анкету водителя, если назначен
  let driver = null
  if (o.driverId) {
    const drv = await Drivers.where({ _openid: o.driverId }).get()
    driver = drv.data[0] || null
  }
  return ok({ order: o, driver })
}

// ============================================================
//  ВОДИТЕЛЬ: открытые заказы (только для одобренных)
// ============================================================
async function availableOrders(openid) {
  const gate = await requireApprovedDriver(openid)
  if (!gate.ok) return fail(gate.reason, 'Доступ к заказам только после одобрения анкеты')

  const res = await Orders.where({ status: 'new', driverId: null })
    .orderBy('createdAt', 'desc').limit(50).get()

  // Пометим заказы, на которые этот водитель уже откликнулся
  const orders = res.data
  const ids = orders.map(o => o._id)
  let appliedSet = {}
  if (ids.length) {
    const myApps = await Apps.where({
      driverOpenid: openid,
      orderId: _.in(ids)
    }).get()
    myApps.data.forEach(a => { appliedSet[a.orderId] = true })
  }
  return ok(orders.map(o => Object.assign({}, o, { applied: !!appliedSet[o._id] })))
}

// ВОДИТЕЛЬ: откликнуться на заказ
async function orderApply(openid, event) {
  const gate = await requireApprovedDriver(openid)
  if (!gate.ok) return fail(gate.reason, 'Откликаться могут только одобренные водители')

  const id = event.orderId
  const doc = await Orders.doc(id).get().catch(() => null)
  if (!doc || !doc.data) return fail('NOT_FOUND', 'Заказ не найден')
  const o = doc.data
  if (o.status !== 'new' || o.driverId) return fail('TAKEN', 'Заказ уже занят')

  // Уже откликался?
  const exist = await Apps.where({ orderId: id, driverOpenid: openid }).count()
  if (exist.total > 0) return fail('ALREADY_APPLIED', 'Вы уже откликнулись')

  const d = gate.driver
  await Apps.add({ data: {
    orderId: id,
    driverOpenid: openid,
    // снимок данных водителя на момент отклика
    driver: {
      fullname: d.fullname, phone: d.phone, wechat: d.wechat,
      truck: d.truck, plate: d.plate, rating: d.rating || null
    },
    message: String(event.message || '').slice(0, 200),
    status: 'pending',        // pending → chosen / rejected
    createdAt: now()
  }})

  await Orders.doc(id).update({ data: { appsCount: _.inc(1) } })
  return ok({ applied: true })
}

// ВОДИТЕЛЬ: мои рейсы (где меня выбрали)
async function myLoads(openid) {
  const res = await Orders.where({ driverId: openid })
    .orderBy('createdAt', 'desc').get()
  return ok(res.data)
}

// ============================================================
//  ОТКЛИКИ / ВЫБОР ВОДИТЕЛЯ
// ============================================================
// КЛИЕНТ: список откликнувшихся на его заказ
async function orderApplications(openid, event) {
  const id = event.orderId
  const doc = await Orders.doc(id).get().catch(() => null)
  if (!doc || !doc.data) return fail('NOT_FOUND', 'Заказ не найден')
  if (doc.data._openid !== openid && !isAdmin(openid)) return fail('FORBIDDEN', 'Нет доступа')

  const res = await Apps.where({ orderId: id })
    .orderBy('createdAt', 'asc').get()
  return ok({ order: doc.data, applications: res.data })
}

// КЛИЕНТ: выбрать водителя
async function orderChoose(openid, event) {
  const id = event.orderId
  const driverOpenid = event.driverOpenid
  const doc = await Orders.doc(id).get().catch(() => null)
  if (!doc || !doc.data) return fail('NOT_FOUND', 'Заказ не найден')
  const o = doc.data
  if (o._openid !== openid) return fail('FORBIDDEN', 'Только владелец заказа может выбрать водителя')
  if (o.driverId) return fail('ALREADY_CHOSEN', 'Водитель уже выбран')

  // Проверим, что этот водитель действительно откликался
  const app = await Apps.where({ orderId: id, driverOpenid }).get()
  if (!app.data.length) return fail('NO_APPLICATION', 'Этот водитель не откликался')

  // Назначаем
  await Orders.doc(id).update({ data: {
    driverId: driverOpenid,
    status: 'taken',
    takenAt: now(),
    history: _.push([{ status: 'taken', at: now() }])
  }})

  // Обновляем статусы откликов: выбранный chosen, остальные rejected
  await Apps.doc(app.data[0]._id).update({ data: { status: 'chosen' } })
  await Apps.where({ orderId: id, driverOpenid: _.neq(driverOpenid) })
    .update({ data: { status: 'rejected' } })

  return ok({ chosen: driverOpenid })
}

// ============================================================
//  ДОГОВОР: подпись (accept) клиента или водителя
//  Каждая подпись фиксируется как криптографическая метка:
//    - snapshot: детерминированный JSON неизменяемых полей договора
//    - hash: SHA-256 от snapshot + версия текста + сторона + серверное время
//    - openid стороны + серверный timestamp (клиент подделать не может)
//  Это база под будущую интеграцию с 法大大 / НУЦ РК —
//  цепочка хэшей уже соответствует требованиям электронной подписи.
// ============================================================
function contractSnapshot(order, driver, clientKyc) {
  // Детерминированный порядок ключей — важно для стабильности хэша
  const snap = {
    version: CONTRACT_VERSION,
    orderId: order._id,
    number: order.number,
    createdAt: order.createdAt,
    parties: {
      client: {
        openid: order._openid,
        name: order.name || '',
        phone: order.phone || '',
        // KYC-идентификатор входит в хэш — подмена личности изменит подпись
        kyc: clientKyc ? {
          type: clientKyc.type, country: clientKyc.country,
          idNumber: clientKyc.idNumber, name: clientKyc.name
        } : null
      },
      driver: driver ? {
        openid: order.driverId,
        fullname: driver.fullname || '',
        phone: driver.phone || '',
        truck: driver.truck || '',
        plate: driver.plate || ''
      } : null
    },
    subject: {
      fromCity: order.fromCity || '',
      countryCode: order.countryCode || '',
      countryName: order.countryName || '',
      borderCode: order.borderCode || '',
      borderName: order.borderName || '',
      toCity: order.toCity || '',
      goodsType: order.goodsType || '',
      weight: order.weight || '',
      volume: order.volume || '',
      totalKm: (order.route && order.route.totalKm) || null,
      etaDays: (order.route && order.route.etaDays) || null
    },
    price: order.price || null,
    note: order.note || ''
  }
  return JSON.stringify(snap)
}

function sha256(s) {
  return crypto.createHash('sha256').update(s).digest('hex')
}

async function contractAccept(openid, event) {
  const id = event.orderId
  const doc = await Orders.doc(id).get().catch(() => null)
  if (!doc || !doc.data) return fail('NOT_FOUND', 'Заказ не найден')
  const o = doc.data

  let role
  if (o._openid === openid) role = 'client'
  else if (o.driverId === openid) role = 'driver'
  else return fail('FORBIDDEN', 'Нет доступа к договору')

  // Клиент обязан пройти KYC перед подписью — концепция клиента
  let clientKyc = null
  if (role === 'client') {
    const gate = await requireClientKyc(openid)
    if (!gate.ok) {
      return fail(gate.rejected ? 'KYC_REJECTED' : 'KYC_REQUIRED',
        gate.rejected ? ('KYC отклонён: ' + (gate.reason || '')) : 'Требуется верификация личности')
    }
    clientKyc = gate.kyc
  } else {
    // При подписании водителем прикладываем KYC клиента к snapshot,
    // если он уже проходил верификацию
    const cu = await Users.where({ _openid: o._openid }).get()
    clientKyc = (cu.data[0] && cu.data[0].kyc) || null
  }

  // Получаем анкету водителя для snapshot (если назначен)
  let driver = null
  if (o.driverId) {
    const drv = await Drivers.where({ _openid: o.driverId }).get()
    driver = drv.data[0] || null
  }

  const at = now()
  const snapshot = contractSnapshot(o, driver, clientKyc)
  const snapshotHash = sha256(snapshot)
  // Полный отпечаток подписи: снимок + версия + роль + время + openid.
  // Изменение любого элемента → другой fingerprint.
  const signaturePayload = [
    CONTRACT_VERSION, snapshotHash, role, String(at), openid
  ].join('|')
  const fingerprint = sha256(signaturePayload)

  const signature = {
    role,
    openid,
    contractVersion: CONTRACT_VERSION,
    snapshotHash,
    fingerprint,
    at
  }

  const patch = {
    signatures: _.push([signature])
  }
  if (role === 'client') patch.clientAcceptedAt = at
  else patch.driverAcceptedAt = at

  await Orders.doc(id).update({ data: patch })
  return ok({ role, at, fingerprint, snapshotHash, contractVersion: CONTRACT_VERSION })
}

// ============================================================
//  СТАТУСЫ РЕЙСА (двигает назначенный водитель)
// ============================================================
const STATUS_FLOW = {
  taken:      ['loaded'],
  loaded:     ['in_transit'],
  in_transit: ['at_border', 'delivered'],
  at_border:  ['in_transit', 'delivered'],
  delivered:  []
}

async function orderAdvance(openid, event) {
  const id = event.orderId
  const newStatus = event.status
  const doc = await Orders.doc(id).get().catch(() => null)
  if (!doc || !doc.data) return fail('NOT_FOUND', 'Заказ не найден')
  const o = doc.data
  if (o.driverId !== openid) return fail('FORBIDDEN', 'Менять статус может только назначенный водитель')
  if (!(o.driverAcceptedAt > 0 && o.clientAcceptedAt > 0)) {
    return fail('NOT_SIGNED', 'Сначала обе стороны должны подписать договор')
  }
  const allowed = STATUS_FLOW[o.status] || []
  if (allowed.indexOf(newStatus) === -1) {
    return fail('BAD_TRANSITION', 'Недопустимый переход статуса')
  }
  await Orders.doc(id).update({ data: {
    status: newStatus,
    history: _.push([{ status: newStatus, at: now() }])
  }})
  return ok({ status: newStatus })
}

// ============================================================
//  АДМИН: список водителей + одобрение/отклонение
// ============================================================
async function adminDrivers(openid, event) {
  if (!isAdmin(openid)) return fail('FORBIDDEN', 'Только для админа')
  const status = event.status || 'pending' // pending | approved | rejected | all
  let q = {}
  if (status !== 'all') q.status = status
  const res = await Drivers.where(q).orderBy('registeredAt', 'desc').limit(100).get()
  return ok(res.data)
}

async function adminReviewDriver(openid, event) {
  if (!isAdmin(openid)) return fail('FORBIDDEN', 'Только для админа')
  const driverOpenid = event.driverOpenid
  const decision = event.decision // 'approve' | 'reject'
  const reason = String(event.reason || '').slice(0, 300)

  const drv = await Drivers.where({ _openid: driverOpenid }).get()
  if (!drv.data.length) return fail('NOT_FOUND', 'Водитель не найден')

  const patch = {
    status: decision === 'approve' ? 'approved' : 'rejected',
    reviewedAt: now(),
    reviewedBy: openid,
    rejectReason: decision === 'reject' ? reason : ''
  }
  await Drivers.doc(drv.data[0]._id).update({ data: patch })
  return ok(patch)
}

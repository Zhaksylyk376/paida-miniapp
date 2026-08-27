// ============================================================
//  Paida API — Cloudflare Worker
//  Единый POST /api/paida с диспетчером на action (как раньше в
//  облачной функции WeChat), плюс отдельные endpoints для загрузки
//  файлов в R2.
// ============================================================

import { Hono } from 'hono'
import { cors } from 'hono/cors'

const app = new Hono()

const CONTRACT_VERSION = 'paida-v1-2026-08'

app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization']
}))

// ------------------------------------------------------------
//  ХЕЛПЕРЫ
// ------------------------------------------------------------
const ok    = (data) => ({ ok: true, data: data === undefined ? null : data })
const fail  = (code, msg) => ({ ok: false, code, msg: msg || code })
const now   = () => Date.now()

const PHONE_RE = /^\+?\d{7,15}$/

function genOrderNumber() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let s = ''
  for (let i = 0; i < 4; i++) s += chars[Math.floor(Math.random() * chars.length)]
  return 'PAIDA-' + s
}

function normPlate(p) {
  return String(p || '').toUpperCase().replace(/[\s\-]/g, '')
}

async function sha256(s) {
  const buf = new TextEncoder().encode(s)
  const digest = await crypto.subtle.digest('SHA-256', buf)
  return Array.from(new Uint8Array(digest))
    .map(b => b.toString(16).padStart(2, '0')).join('')
}

function adminSet(env) {
  return new Set(String(env.ADMIN_TOKENS || '').split(',').map(s => s.trim()).filter(Boolean))
}

// ------------------------------------------------------------
//  АВТОРИЗАЦИЯ: Bearer <device-token>
//  Токен генерирует клиент (uuid) и хранит в wx.setStorageSync.
//  Токен = openid: подделать можно только украв storage у устройства,
//  что для MVP приемлемо. Полноценный auth — потом.
// ------------------------------------------------------------
function extractToken(c) {
  const h = c.req.header('Authorization') || ''
  const m = h.match(/^Bearer\s+(.+)$/i)
  return m ? m[1].trim() : ''
}

async function ensureUser(env, openid) {
  const u = await env.DB.prepare('SELECT * FROM users WHERE id=?').bind(openid).first()
  if (u) return u
  const admins = adminSet(env)
  const isAdmin = admins.has(openid) ? 1 : 0
  await env.DB.prepare(
    'INSERT INTO users(id, role, is_admin, created_at) VALUES(?,?,?,?)'
  ).bind(openid, 'client', isAdmin, now()).run()
  return await env.DB.prepare('SELECT * FROM users WHERE id=?').bind(openid).first()
}

function isAdmin(env, openid) {
  return adminSet(env).has(openid)
}

// ------------------------------------------------------------
//  ГЛАВНЫЙ ENDPOINT — диспетчер по action
// ------------------------------------------------------------
app.post('/api/paida', async (c) => {
  const token = extractToken(c)
  if (!token) return c.json(fail('NO_TOKEN', 'Не передан токен устройства'), 401)

  let body
  try { body = await c.req.json() } catch { body = {} }
  const action = body.action

  // login/whoami не требуют user записи заранее
  const env = c.env
  try {
    switch (action) {
      case 'whoami':            return c.json(ok({ openid: token, isAdmin: isAdmin(env, token) }))
      case 'login':             return c.json(await login(env, token))

      case 'driverGet':         return c.json(await driverGet(env, token))
      case 'driverRegister':    return c.json(await driverRegister(env, token, body))

      case 'clientKycGet':      return c.json(await clientKycGet(env, token))
      case 'clientKycSubmit':   return c.json(await clientKycSubmit(env, token, body))

      case 'orderCreate':       return c.json(await orderCreate(env, token, body))
      case 'myOrders':          return c.json(await myOrders(env, token))
      case 'orderGet':          return c.json(await orderGet(env, token, body))

      case 'availableOrders':   return c.json(await availableOrders(env, token))
      case 'orderApply':        return c.json(await orderApply(env, token, body))
      case 'myLoads':           return c.json(await myLoads(env, token))

      case 'orderApplications': return c.json(await orderApplications(env, token, body))
      case 'orderChoose':       return c.json(await orderChoose(env, token, body))

      case 'contractAccept':    return c.json(await contractAccept(env, token, body))
      case 'orderAdvance':      return c.json(await orderAdvance(env, token, body))

      case 'adminDrivers':      return c.json(await adminDrivers(env, token, body))
      case 'adminReviewDriver': return c.json(await adminReviewDriver(env, token, body))

      default:
        return c.json(fail('UNKNOWN_ACTION', 'Неизвестное действие: ' + action))
    }
  } catch (e) {
    console.error('[paida] error in', action, e && e.stack || e)
    return c.json(fail('SERVER_ERROR', (e && e.message) || 'server error'), 500)
  }
})

// ------------------------------------------------------------
//  LOGIN
// ------------------------------------------------------------
async function login(env, openid) {
  const user = await ensureUser(env, openid)
  const drv = await env.DB.prepare('SELECT status FROM drivers WHERE openid=?').bind(openid).first()
  return ok({
    openid,
    isAdmin: isAdmin(env, openid),
    role: user.role || 'client',
    driverStatus: drv ? drv.status : null,
    kycStatus: user.kyc_status || null
  })
}

async function setRole(env, openid, role) {
  await ensureUser(env, openid)
  await env.DB.prepare('UPDATE users SET role=? WHERE id=?').bind(role, openid).run()
}

// ------------------------------------------------------------
//  ВОДИТЕЛЬ
// ------------------------------------------------------------
async function driverGet(env, openid) {
  const d = await env.DB.prepare('SELECT * FROM drivers WHERE openid=?').bind(openid).first()
  if (!d) return ok(null)
  return ok(shapeDriver(d))
}

function shapeDriver(d) {
  return {
    _openid: d.openid,
    fullname: d.fullname, phone: d.phone, wechat: d.wechat || '',
    truck: d.truck, plate: d.plate, license: d.license || '', route: d.route || '',
    docs: {
      techpassport: d.doc_techpassport,
      driverlicense: d.doc_driverlicense,
      carphoto: d.doc_carphoto
    },
    checks: d.checks_json ? JSON.parse(d.checks_json) : null,
    status: d.status,
    rating: d.rating,
    rejectReason: d.reject_reason || '',
    registeredAt: d.registered_at,
    reviewedAt: d.reviewed_at
  }
}

async function driverRegister(env, openid, body) {
  await ensureUser(env, openid)
  const form = body.form || {}
  const docs = body.docs || {}

  const problems = []
  if (!form.fullname || String(form.fullname).trim().length < 2) problems.push('FULLNAME')
  if (!PHONE_RE.test(form.phone || '')) problems.push('PHONE')
  if (!form.truck || String(form.truck).trim().length < 2) problems.push('TRUCK')
  if (!normPlate(form.plate)) problems.push('PLATE')
  if (!docs.techpassport)  problems.push('DOC_TECHPASSPORT')
  if (!docs.driverlicense) problems.push('DOC_LICENSE')
  if (!docs.carphoto)      problems.push('DOC_CARPHOTO')
  if (problems.length) return fail('VALIDATION', 'Проверьте поля и документы')

  const plateNorm = normPlate(form.plate)
  const phone = String(form.phone).trim()

  const dupPlate = await env.DB.prepare(
    'SELECT 1 FROM drivers WHERE plate_norm=? AND openid<>?'
  ).bind(plateNorm, openid).first()
  if (dupPlate) return fail('DUP_PLATE', 'Этот госномер уже зарегистрирован другим водителем')

  const dupPhone = await env.DB.prepare(
    'SELECT 1 FROM drivers WHERE phone=? AND openid<>?'
  ).bind(phone, openid).first()
  if (dupPhone) return fail('DUP_PHONE', 'Этот телефон уже зарегистрирован другим водителем')

  const checks = {
    fieldsValid: true, docsComplete: true, plateUnique: true, phoneUnique: true,
    externalVerified: false, checkedAt: now()
  }

  const exists = await env.DB.prepare('SELECT openid FROM drivers WHERE openid=?').bind(openid).first()

  if (exists) {
    await env.DB.prepare(`
      UPDATE drivers SET fullname=?, phone=?, wechat=?, truck=?, plate=?, plate_norm=?,
        license=?, route=?, doc_techpassport=?, doc_driverlicense=?, doc_carphoto=?,
        checks_json=?, status='pending', reject_reason='', reviewed_at=NULL
      WHERE openid=?
    `).bind(
      String(form.fullname).trim(), phone, String(form.wechat || '').trim(),
      String(form.truck).trim(), String(form.plate).trim(), plateNorm,
      String(form.license || '').trim(), String(form.route || '').trim(),
      docs.techpassport, docs.driverlicense, docs.carphoto,
      JSON.stringify(checks), openid
    ).run()
  } else {
    await env.DB.prepare(`
      INSERT INTO drivers(openid, fullname, phone, wechat, truck, plate, plate_norm,
        license, route, doc_techpassport, doc_driverlicense, doc_carphoto,
        checks_json, status, registered_at)
      VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)
    `).bind(
      openid, String(form.fullname).trim(), phone, String(form.wechat || '').trim(),
      String(form.truck).trim(), String(form.plate).trim(), plateNorm,
      String(form.license || '').trim(), String(form.route || '').trim(),
      docs.techpassport, docs.driverlicense, docs.carphoto,
      JSON.stringify(checks), now()
    ).run()
  }

  await setRole(env, openid, 'driver')
  return ok({ status: 'pending' })
}

async function requireApprovedDriver(env, openid) {
  const d = await env.DB.prepare('SELECT * FROM drivers WHERE openid=?').bind(openid).first()
  if (!d) return { ok: false, reason: 'NO_PROFILE' }
  if (d.status !== 'approved') return { ok: false, reason: 'NOT_APPROVED', status: d.status }
  return { ok: true, driver: d }
}

// ------------------------------------------------------------
//  KYC КЛИЕНТА
// ------------------------------------------------------------
const ID_RE = {
  'cn.physical': /^\d{17}[\dXx]$/,
  'cn.legal':    /^[0-9A-Za-z]{18}$/,
  'kz.physical': /^\d{12}$/,
  'kz.legal':    /^\d{12}$/
}
function normId(s) { return String(s || '').toUpperCase().replace(/\s+/g, '') }

async function clientKycGet(env, openid) {
  const u = await env.DB.prepare('SELECT * FROM users WHERE id=?').bind(openid).first()
  if (!u || !u.kyc_status) return ok(null)
  return ok({
    type: u.kyc_type, country: u.kyc_country,
    name: u.kyc_name, idNumber: u.kyc_id_number,
    docFileID: u.kyc_doc_file_id, status: u.kyc_status,
    submittedAt: u.kyc_submitted_at, reviewedAt: u.kyc_reviewed_at,
    rejectReason: u.kyc_reject_reason || ''
  })
}

async function clientKycSubmit(env, openid, body) {
  await ensureUser(env, openid)
  const form = body.form || {}
  const docFileID = body.docFileID || ''
  const type = form.type, country = form.country
  const key = `${country}.${type}`
  const re = ID_RE[key]
  if (!re) return fail('VALIDATION', 'Неверная страна или тип')

  const idNumber = normId(form.idNumber)
  if (!re.test(idNumber)) return fail('BAD_ID', 'Формат идентификатора не совпадает с выбранным типом')

  const name = String(form.name || '').trim()
  if (name.length < 2) return fail('BAD_NAME', 'Укажите ФИО или наименование')

  if (!docFileID) return fail('DOC_REQUIRED', 'Загрузите фото документа')

  const kycIdKey = key + ':' + idNumber
  const dup = await env.DB.prepare(
    'SELECT 1 FROM users WHERE kyc_id_key=? AND id<>?'
  ).bind(kycIdKey, openid).first()
  if (dup) return fail('DUP_ID', 'Этот идентификатор уже зарегистрирован другим пользователем')

  const t = now()
  await env.DB.prepare(`
    UPDATE users SET
      kyc_type=?, kyc_country=?, kyc_name=?, kyc_id_number=?, kyc_id_key=?,
      kyc_doc_file_id=?, kyc_status='submitted',
      kyc_submitted_at=?, kyc_reviewed_at=NULL, kyc_reviewed_by=NULL, kyc_reject_reason=''
    WHERE id=?
  `).bind(type, country, name, idNumber, kycIdKey, docFileID, t, openid).run()

  return ok({ status: 'submitted', submittedAt: t })
}

async function requireClientKyc(env, openid) {
  const u = await env.DB.prepare('SELECT kyc_status, kyc_reject_reason FROM users WHERE id=?')
    .bind(openid).first()
  if (!u || !u.kyc_status) return { ok: false }
  if (u.kyc_status === 'rejected') return { ok: false, rejected: true, reason: u.kyc_reject_reason }
  return { ok: true }
}

// ------------------------------------------------------------
//  ЗАКАЗЫ — КЛИЕНТ
// ------------------------------------------------------------
async function orderCreate(env, openid, body) {
  await ensureUser(env, openid)
  const f = body.form || {}
  if (!f.countryCode || !f.name || !PHONE_RE.test(f.phone || '')) {
    return fail('VALIDATION', 'Проверьте страну, имя и телефон')
  }
  if (!f.weight && !f.volume) {
    return fail('VALIDATION', 'Укажите вес или объём')
  }

  let number
  for (let i = 0; i < 5; i++) {
    number = genOrderNumber()
    const clash = await env.DB.prepare('SELECT 1 FROM orders WHERE number=?').bind(number).first()
    if (!clash) break
  }

  const historyJson = JSON.stringify([{ status: 'new', at: now() }])
  const priceJson = f.price ? JSON.stringify(f.price) : null

  const res = await env.DB.prepare(`
    INSERT INTO orders(openid, number, from_city, country_code, country_name,
      border_code, border_name, to_city, goods_type, weight, volume,
      name, phone, wechat, note, price_json, history_json, created_at)
    VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    openid, number, f.fromCity || '', f.countryCode, f.countryName || '',
    f.borderCode || '', f.borderName || '', f.toCity || '',
    f.goodsType || '', f.weight || '', f.volume || '',
    f.name, f.phone, f.wechat || '', f.note || '',
    priceJson, historyJson, now()
  ).run()

  return ok({ _id: res.meta.last_row_id, number })
}

function shapeOrder(o) {
  return {
    _id: o.id,
    _openid: o.openid,
    number: o.number,
    fromCity: o.from_city, countryCode: o.country_code, countryName: o.country_name,
    borderCode: o.border_code, borderName: o.border_name, toCity: o.to_city,
    goodsType: o.goods_type, weight: o.weight, volume: o.volume,
    name: o.name, phone: o.phone, wechat: o.wechat, note: o.note,
    price: o.price_json ? JSON.parse(o.price_json) : null,
    status: o.status, driverId: o.driver_id, appsCount: o.apps_count || 0,
    clientAcceptedAt: o.client_accepted_at || 0,
    driverAcceptedAt: o.driver_accepted_at || 0,
    signatures: o.signatures_json ? JSON.parse(o.signatures_json) : [],
    history: o.history_json ? JSON.parse(o.history_json) : [],
    createdAt: o.created_at
  }
}

async function myOrders(env, openid) {
  const r = await env.DB.prepare(
    'SELECT * FROM orders WHERE openid=? ORDER BY created_at DESC'
  ).bind(openid).all()
  return ok((r.results || []).map(shapeOrder))
}

async function orderGet(env, openid, body) {
  const id = body.orderId
  const o = await env.DB.prepare('SELECT * FROM orders WHERE id=?').bind(id).first()
  if (!o) return fail('NOT_FOUND', 'Заказ не найден')
  const allowed = o.openid === openid || o.driver_id === openid || isAdmin(env, openid)
  if (!allowed) return fail('FORBIDDEN', 'Нет доступа к заказу')

  let driver = null
  if (o.driver_id) {
    const d = await env.DB.prepare('SELECT * FROM drivers WHERE openid=?').bind(o.driver_id).first()
    driver = d ? shapeDriver(d) : null
  }
  return ok({ order: shapeOrder(o), driver })
}

// ------------------------------------------------------------
//  ЗАКАЗЫ — ВОДИТЕЛЬ
// ------------------------------------------------------------
async function availableOrders(env, openid) {
  const gate = await requireApprovedDriver(env, openid)
  if (!gate.ok) return fail(gate.reason, 'Доступ к заказам только после одобрения анкеты')

  const r = await env.DB.prepare(
    `SELECT * FROM orders WHERE status='new' AND driver_id IS NULL
     ORDER BY created_at DESC LIMIT 50`
  ).all()
  const orders = (r.results || []).map(shapeOrder)

  if (orders.length === 0) return ok([])
  const ids = orders.map(o => o._id)
  const placeholders = ids.map(() => '?').join(',')
  const myApps = await env.DB.prepare(
    `SELECT order_id FROM applications WHERE driver_openid=? AND order_id IN (${placeholders})`
  ).bind(openid, ...ids).all()
  const applied = new Set((myApps.results || []).map(a => a.order_id))
  return ok(orders.map(o => Object.assign({}, o, { applied: applied.has(o._id) })))
}

async function orderApply(env, openid, body) {
  const gate = await requireApprovedDriver(env, openid)
  if (!gate.ok) return fail(gate.reason, 'Откликаться могут только одобренные водители')

  const id = body.orderId
  const o = await env.DB.prepare('SELECT * FROM orders WHERE id=?').bind(id).first()
  if (!o) return fail('NOT_FOUND', 'Заказ не найден')
  if (o.status !== 'new' || o.driver_id) return fail('TAKEN', 'Заказ уже занят')

  const already = await env.DB.prepare(
    'SELECT 1 FROM applications WHERE order_id=? AND driver_openid=?'
  ).bind(id, openid).first()
  if (already) return fail('ALREADY_APPLIED', 'Вы уже откликнулись')

  const d = gate.driver
  const snap = JSON.stringify({
    fullname: d.fullname, phone: d.phone, wechat: d.wechat,
    truck: d.truck, plate: d.plate, rating: d.rating || null
  })

  await env.DB.prepare(
    'INSERT INTO applications(order_id, driver_openid, driver_snap, message, created_at) VALUES(?,?,?,?,?)'
  ).bind(id, openid, snap, String(body.message || '').slice(0, 200), now()).run()

  await env.DB.prepare('UPDATE orders SET apps_count = apps_count + 1 WHERE id=?').bind(id).run()
  return ok({ applied: true })
}

async function myLoads(env, openid) {
  const r = await env.DB.prepare(
    'SELECT * FROM orders WHERE driver_id=? ORDER BY created_at DESC'
  ).bind(openid).all()
  return ok((r.results || []).map(shapeOrder))
}

// ------------------------------------------------------------
//  ОТКЛИКИ / ВЫБОР
// ------------------------------------------------------------
async function orderApplications(env, openid, body) {
  const id = body.orderId
  const o = await env.DB.prepare('SELECT * FROM orders WHERE id=?').bind(id).first()
  if (!o) return fail('NOT_FOUND', 'Заказ не найден')
  if (o.openid !== openid && !isAdmin(env, openid)) return fail('FORBIDDEN', 'Нет доступа')

  const r = await env.DB.prepare(
    'SELECT * FROM applications WHERE order_id=? ORDER BY created_at ASC'
  ).bind(id).all()
  const apps = (r.results || []).map(a => ({
    _id: a.id, orderId: a.order_id, driverOpenid: a.driver_openid,
    driver: a.driver_snap ? JSON.parse(a.driver_snap) : {},
    message: a.message || '', status: a.status, createdAt: a.created_at
  }))
  return ok({ order: shapeOrder(o), applications: apps })
}

async function orderChoose(env, openid, body) {
  const id = body.orderId
  const driverOpenid = body.driverOpenid
  const o = await env.DB.prepare('SELECT * FROM orders WHERE id=?').bind(id).first()
  if (!o) return fail('NOT_FOUND', 'Заказ не найден')
  if (o.openid !== openid) return fail('FORBIDDEN', 'Только владелец заказа может выбрать водителя')
  if (o.driver_id) return fail('ALREADY_CHOSEN', 'Водитель уже выбран')

  const app = await env.DB.prepare(
    'SELECT * FROM applications WHERE order_id=? AND driver_openid=?'
  ).bind(id, driverOpenid).first()
  if (!app) return fail('NO_APPLICATION', 'Этот водитель не откликался')

  const t = now()
  const history = o.history_json ? JSON.parse(o.history_json) : []
  history.push({ status: 'taken', at: t })

  await env.DB.batch([
    env.DB.prepare(
      `UPDATE orders SET driver_id=?, status='taken', taken_at=?, history_json=? WHERE id=?`
    ).bind(driverOpenid, t, JSON.stringify(history), id),
    env.DB.prepare(`UPDATE applications SET status='chosen' WHERE id=?`).bind(app.id),
    env.DB.prepare(
      `UPDATE applications SET status='rejected' WHERE order_id=? AND driver_openid<>?`
    ).bind(id, driverOpenid)
  ])
  return ok({ chosen: driverOpenid })
}

// ------------------------------------------------------------
//  ДОГОВОР: подпись с хэшем
// ------------------------------------------------------------
function contractSnapshot(order, driver, clientKyc) {
  return JSON.stringify({
    version: CONTRACT_VERSION,
    orderId: order.id,
    number: order.number,
    createdAt: order.created_at,
    parties: {
      client: {
        openid: order.openid, name: order.name || '', phone: order.phone || '',
        kyc: clientKyc ? {
          type: clientKyc.type, country: clientKyc.country,
          idNumber: clientKyc.idNumber, name: clientKyc.name
        } : null
      },
      driver: driver ? {
        openid: order.driver_id, fullname: driver.fullname || '',
        phone: driver.phone || '', truck: driver.truck || '', plate: driver.plate || ''
      } : null
    },
    subject: {
      fromCity: order.from_city || '', countryCode: order.country_code || '',
      countryName: order.country_name || '',
      borderCode: order.border_code || '', borderName: order.border_name || '',
      toCity: order.to_city || '',
      goodsType: order.goods_type || '', weight: order.weight || '', volume: order.volume || ''
    },
    price: order.price_json ? JSON.parse(order.price_json) : null,
    note: order.note || ''
  })
}

async function contractAccept(env, openid, body) {
  const id = body.orderId
  const o = await env.DB.prepare('SELECT * FROM orders WHERE id=?').bind(id).first()
  if (!o) return fail('NOT_FOUND', 'Заказ не найден')

  let role
  if (o.openid === openid) role = 'client'
  else if (o.driver_id === openid) role = 'driver'
  else return fail('FORBIDDEN', 'Нет доступа к договору')

  let clientKyc = null
  if (role === 'client') {
    const gate = await requireClientKyc(env, openid)
    if (!gate.ok) {
      return fail(gate.rejected ? 'KYC_REJECTED' : 'KYC_REQUIRED',
        gate.rejected ? ('KYC отклонён: ' + (gate.reason || '')) : 'Требуется верификация личности')
    }
    const k = await clientKycGet(env, openid)
    clientKyc = k.data
  } else {
    const k = await clientKycGet(env, o.openid)
    clientKyc = k.data
  }

  let driver = null
  if (o.driver_id) {
    driver = await env.DB.prepare('SELECT * FROM drivers WHERE openid=?').bind(o.driver_id).first()
  }

  const t = now()
  const snapshot = contractSnapshot(o, driver, clientKyc)
  const snapshotHash = await sha256(snapshot)
  const fingerprint = await sha256([CONTRACT_VERSION, snapshotHash, role, String(t), openid].join('|'))

  const sigs = o.signatures_json ? JSON.parse(o.signatures_json) : []
  sigs.push({
    role, openid,
    contractVersion: CONTRACT_VERSION,
    snapshotHash, fingerprint, at: t
  })

  if (role === 'client') {
    await env.DB.prepare(
      'UPDATE orders SET client_accepted_at=?, signatures_json=? WHERE id=?'
    ).bind(t, JSON.stringify(sigs), id).run()
  } else {
    await env.DB.prepare(
      'UPDATE orders SET driver_accepted_at=?, signatures_json=? WHERE id=?'
    ).bind(t, JSON.stringify(sigs), id).run()
  }

  return ok({ role, at: t, fingerprint, snapshotHash, contractVersion: CONTRACT_VERSION })
}

// ------------------------------------------------------------
//  СТАТУСЫ РЕЙСА
// ------------------------------------------------------------
const STATUS_FLOW = {
  taken:      ['loaded'],
  loaded:     ['in_transit'],
  in_transit: ['at_border', 'delivered'],
  at_border:  ['in_transit', 'delivered'],
  delivered:  []
}

async function orderAdvance(env, openid, body) {
  const id = body.orderId
  const newStatus = body.status
  const o = await env.DB.prepare('SELECT * FROM orders WHERE id=?').bind(id).first()
  if (!o) return fail('NOT_FOUND', 'Заказ не найден')
  if (o.driver_id !== openid) return fail('FORBIDDEN', 'Менять статус может только назначенный водитель')
  if (!(o.driver_accepted_at > 0 && o.client_accepted_at > 0)) {
    return fail('NOT_SIGNED', 'Сначала обе стороны должны подписать договор')
  }
  const allowed = STATUS_FLOW[o.status] || []
  if (allowed.indexOf(newStatus) === -1) {
    return fail('BAD_TRANSITION', 'Недопустимый переход статуса')
  }
  const history = o.history_json ? JSON.parse(o.history_json) : []
  history.push({ status: newStatus, at: now() })
  await env.DB.prepare(
    'UPDATE orders SET status=?, history_json=? WHERE id=?'
  ).bind(newStatus, JSON.stringify(history), id).run()
  return ok({ status: newStatus })
}

// ------------------------------------------------------------
//  АДМИН
// ------------------------------------------------------------
async function adminDrivers(env, openid, body) {
  if (!isAdmin(env, openid)) return fail('FORBIDDEN', 'Только для админа')
  const status = body.status || 'pending'
  let q, args
  if (status === 'all') {
    q = 'SELECT * FROM drivers ORDER BY registered_at DESC LIMIT 100'
    args = []
  } else {
    q = 'SELECT * FROM drivers WHERE status=? ORDER BY registered_at DESC LIMIT 100'
    args = [status]
  }
  const r = await env.DB.prepare(q).bind(...args).all()
  return ok((r.results || []).map(shapeDriver))
}

async function adminReviewDriver(env, openid, body) {
  if (!isAdmin(env, openid)) return fail('FORBIDDEN', 'Только для админа')
  const driverOpenid = body.driverOpenid
  const decision = body.decision
  const reason = String(body.reason || '').slice(0, 300)

  const d = await env.DB.prepare('SELECT openid FROM drivers WHERE openid=?').bind(driverOpenid).first()
  if (!d) return fail('NOT_FOUND', 'Водитель не найден')

  const status = decision === 'approve' ? 'approved' : 'rejected'
  const rej = decision === 'reject' ? reason : ''
  await env.DB.prepare(
    'UPDATE drivers SET status=?, reviewed_at=?, reviewed_by=?, reject_reason=? WHERE openid=?'
  ).bind(status, now(), openid, rej, driverOpenid).run()
  return ok({ status, reviewedAt: now(), reviewedBy: openid, rejectReason: rej })
}

// ============================================================
//  ЗАГРУЗКА ФАЙЛОВ В R2
// ============================================================
app.post('/api/upload', async (c) => {
  const token = extractToken(c)
  if (!token) return c.json(fail('NO_TOKEN'), 401)

  const form = await c.req.parseBody()
  const file = form.file
  const folder = String(form.folder || 'misc').replace(/[^a-z0-9_\-]/gi, '')
  if (!file || typeof file === 'string') return c.json(fail('NO_FILE', 'Не передан файл'), 400)

  const ext = ((file.name || 'file').match(/\.\w+$/) || ['.jpg'])[0]
  const key = `${folder}/${crypto.randomUUID()}${ext}`

  await c.env.R2.put(key, file.stream(), {
    httpMetadata: { contentType: file.type || 'application/octet-stream' }
  })
  return c.json(ok({ fileID: key }))
})

// ============================================================
//  ОТДАЧА ФАЙЛОВ ИЗ R2
//  file вида "client-kyc/xxx.jpg" — сервим как есть
// ============================================================
app.get('/uploads/*', async (c) => {
  const key = decodeURIComponent(c.req.path.replace(/^\/uploads\//, ''))
  const obj = await c.env.R2.get(key)
  if (!obj) return c.notFound()
  const headers = new Headers()
  obj.writeHttpMetadata(headers)
  headers.set('cache-control', 'public, max-age=31536000, immutable')
  return new Response(obj.body, { headers })
})

// ------------------------------------------------------------
app.get('/', (c) => c.text('Paida API is up'))

export default app

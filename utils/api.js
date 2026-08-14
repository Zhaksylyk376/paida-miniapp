const config = require('./config.js')

function isConfigured() {
  return config.TG_BOT_TOKEN &&
         !config.TG_BOT_TOKEN.startsWith('PASTE_') &&
         config.TG_MANAGER_CHAT_IDS.length > 0 &&
         !config.TG_MANAGER_CHAT_IDS[0].startsWith('PASTE_')
}

function nowStr() {
  const now = new Date()
  return now.toISOString().replace('T', ' ').substring(0, 19)
}

function sendToTelegram(text) {
  return new Promise((resolve, reject) => {
    if (!isConfigured()) {
      const err = new Error('Telegram не настроен — заполните utils/config.js')
      console.warn('[api]', err.message)
      return reject(err)
    }
    const url = `https://api.telegram.org/bot${config.TG_BOT_TOKEN}/sendMessage`
    const sends = config.TG_MANAGER_CHAT_IDS.map(chatId => new Promise((res, rej) => {
      wx.request({
        url,
        method: 'POST',
        data: { chat_id: chatId, text, parse_mode: 'HTML' },
        success: r => {
          if (r.statusCode === 200 && r.data && r.data.ok) res(r.data)
          else rej(new Error((r.data && r.data.description) || 'Telegram API error'))
        },
        fail: e => rej(e)
      })
    }))
    Promise.all(sends).then(resolve).catch(reject)
  })
}

// ---- Заявка клиента ----
function formatOrderMessage(order, lang) {
  const clientTypeLabel = order.clientType === 'business' ? '🏭 Компания из Китая' : '👤 Частное лицо'
  const langLabel = lang === 'ru' ? '🇷🇺 Русский' : '🇨🇳 Китайский'
  const dest = [order.countryName, order.toCity].filter(Boolean).join(', ') || '—'
  const expressBadge = order.express ? ' ⚡️ ЭКСПРЕСС' : ''

  const priceLines = []
  if (order.price) {
    priceLines.push(
      '',
      `💰 <b>Расчётная цена:</b> ${order.price.currency} ${order.price.total}${expressBadge}`,
      `<i>оплачиваемый вес ${order.price.chargeableKg} кг · срок ${order.price.days} дн.</i>`
    )
  }

  return [
    '📦 <b>Новая заявка на доставку</b>',
    '',
    `<b>Тип клиента:</b> ${clientTypeLabel}`,
    `<b>Откуда (Китай):</b> ${order.fromCity || '—'}`,
    `<b>Куда:</b> ${dest}`,
    `<b>Груз:</b> ${order.goodsType || '—'}`,
    `<b>Вес:</b> ${order.weight || '—'} кг`,
    `<b>Объём:</b> ${order.volume || '—'} м³`,
    ...priceLines,
    '',
    `<b>Контакт:</b> ${order.name || '—'}`,
    `<b>Телефон:</b> <code>${order.phone || '—'}</code>`,
    order.note ? `<b>Комментарий:</b> ${order.note}` : null,
    '',
    `<i>Язык формы: ${langLabel}</i>`,
    `<i>${nowStr()}</i>`
  ].filter(Boolean).join('\n')
}

function sendOrder(order, lang) {
  return sendToTelegram(formatOrderMessage(order, lang))
}

// ---- Регистрация водителя ----
function formatDriverRegistration(profile) {
  return [
    '🚚 <b>Новая регистрация водителя</b>',
    '',
    `<b>ФИО:</b> ${profile.fullname || '—'}`,
    `<b>Телефон:</b> <code>${profile.phone || '—'}</code>`,
    `<b>WeChat:</b> ${profile.wechat || '—'}`,
    `<b>Модель:</b> ${profile.truck || '—'}`,
    `<b>Гос. номер:</b> <code>${profile.plate || '—'}</code>`,
    `<b>Вод. удостоверение:</b> ${profile.license || '—'}`,
    `<b>Направление:</b> ${profile.route || '—'}`,
    '',
    '⏳ <i>Ожидает одобрения</i>',
    `<i>${nowStr()}</i>`
  ].join('\n')
}

function sendDriverRegistration(profile) {
  return sendToTelegram(formatDriverRegistration(profile))
}

// ---- Обновление статуса рейса ----
const STATUS_EMOJI = {
  loaded: '📦',
  in_transit: '🚛',
  at_border: '🛃',
  delivered: '✅'
}

function statusLabel(status) {
  return {
    new: 'Новый',
    loaded: 'Загружен',
    in_transit: 'В пути',
    at_border: 'На границе',
    delivered: 'Доставлен'
  }[status] || status
}

function formatStatusUpdate({ load, driver, oldStatus, newStatus }) {
  const emoji = STATUS_EMOJI[newStatus] || '🔔'
  return [
    `${emoji} <b>Обновление статуса рейса</b>`,
    '',
    `<b>Рейс:</b> <code>${load.number}</code>`,
    `<b>Маршрут:</b> ${load.route || '—'}`,
    load.client ? `<b>Клиент:</b> ${load.client}` : null,
    '',
    `<b>Статус:</b> ${statusLabel(oldStatus)} → <b>${statusLabel(newStatus)}</b>`,
    '',
    `<b>Водитель:</b> ${driver ? driver.fullname : '—'}`,
    driver && driver.phone ? `<b>Телефон:</b> <code>${driver.phone}</code>` : null,
    driver && driver.plate ? `<b>Гос. номер:</b> <code>${driver.plate}</code>` : null,
    '',
    `<i>${nowStr()}</i>`
  ].filter(Boolean).join('\n')
}

function sendStatusUpdate(payload) {
  return sendToTelegram(formatStatusUpdate(payload))
}

module.exports = {
  isConfigured,
  sendOrder,
  sendDriverRegistration,
  sendStatusUpdate
}

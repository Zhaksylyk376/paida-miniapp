const config = require('./config.js')

function getCountriesList(lang) {
  return config.COUNTRIES_ORDER.map(code => {
    const t = config.TARIFFS[code]
    return {
      code,
      name: lang === 'ru' ? t.nameRu : t.nameZh,
      days: t.days
    }
  })
}

// Пункты пропуска, доступные для страны назначения
function getBorderCrossings(countryCode, lang) {
  return config.BORDER_CROSSINGS
    .filter(b => !countryCode || b.throughCountries.indexOf(countryCode) !== -1)
    .map(b => ({
      code: b.code,
      name: lang === 'ru' ? b.nameRu : b.nameZh,
      coords: b.coords,
      avgQueueHours: b.avgQueueHours
    }))
}

// Нормализация названия города: нижний регистр, обрезаем пробелы
function _normCity(s) {
  return String(s || '').trim().toLowerCase()
}

// Оценка маршрута: км + часы в пути + часы в очереди на таможне.
// Если данных о городе нет — возвращаем только очередь и километраж
// от границы (если указан).
function estimateRoute({ fromCity, toCity, borderCode }) {
  const border = config.BORDER_CROSSINGS.find(b => b.code === borderCode)
  if (!border) return null

  const fromKm = (config.CITY_TO_BORDER_KM[_normCity(fromCity)] || {})[borderCode]
  const toKm   = (config.BORDER_TO_CITY_KM[borderCode] || {})[_normCity(toCity)]

  const totalKm = (fromKm || 0) + (toKm || 0)
  const driveDays = totalKm > 0 ? Math.ceil(totalKm / config.KM_PER_DAY) : null
  const queueDays = Math.ceil(border.avgQueueHours / 24)
  const etaDays = driveDays !== null ? driveDays + queueDays : null

  return {
    borderCode: border.code,
    borderCoords: border.coords,
    queueHours: border.avgQueueHours,
    queueDays,
    fromKm: fromKm || null,
    toKm: toKm || null,
    totalKm: totalKm || null,
    driveDays,
    etaDays,
    known: !!(fromKm && toKm)
  }
}

// Возвращает { chargeableKg, base, borderFee, total, currency, days, pricePerKg }
// Всё в USD. Если данных не хватает — null
function calcPrice({ countryCode, weightKg, volumeM3 }) {
  const tariff = config.TARIFFS[countryCode]
  if (!tariff) return null

  const w = parseFloat(weightKg) || 0
  const v = parseFloat(volumeM3) || 0
  if (w <= 0 && v <= 0) return null

  const chargeableKg = Math.max(w, v * config.VOLUME_TO_KG, tariff.minKg)
  const base = chargeableKg * tariff.pricePerKg
  const borderFee = config.BORDER_FEE
  const total = base + borderFee

  const round2 = (n) => Math.round(n * 100) / 100

  return {
    chargeableKg: Math.round(chargeableKg),
    base: round2(base),
    borderFee: round2(borderFee),
    total: round2(total),
    currency: config.CURRENCY,
    days: tariff.days,
    pricePerKg: tariff.pricePerKg
  }
}

function formatMoney(amount, currency) {
  const cur = currency || config.CURRENCY
  const n = Number(amount)
  const withCommas = n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return `${cur} ${withCommas}`
}

module.exports = { calcPrice, getCountriesList, getBorderCrossings, estimateRoute, formatMoney }

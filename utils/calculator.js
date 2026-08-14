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

// Возвращает { chargeableKg, base, borderFee, express, total, breakdown[] }
// Если данных не хватает — вернёт null
function calcPrice({ countryCode, weightKg, volumeM3, express }) {
  const tariff = config.TARIFFS[countryCode]
  if (!tariff) return null

  const w = parseFloat(weightKg) || 0
  const v = parseFloat(volumeM3) || 0
  if (w <= 0 && v <= 0) return null

  const chargeableKg = Math.max(w, v * config.VOLUME_TO_KG, tariff.minKg)
  const base = chargeableKg * tariff.pricePerKg
  const borderFee = config.BORDER_FEE
  let total = base + borderFee
  const expressExtra = express ? Math.round(total * (config.EXPRESS_MULTIPLIER - 1)) : 0
  total = total + expressExtra

  return {
    chargeableKg: Math.round(chargeableKg),
    base: Math.round(base),
    borderFee,
    expressExtra,
    total: Math.round(total),
    currency: config.CURRENCY,
    days: tariff.days,
    pricePerKg: tariff.pricePerKg
  }
}

function formatMoney(amount, currency) {
  const cur = currency || config.CURRENCY
  // 12500 → "12,500"
  const withCommas = String(amount).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return `${cur} ${withCommas}`
}

module.exports = { calcPrice, getCountriesList, formatMoney }

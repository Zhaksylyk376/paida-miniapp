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

module.exports = { calcPrice, getCountriesList, formatMoney }

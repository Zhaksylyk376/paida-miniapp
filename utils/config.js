// ============================================================
//  НАСТРОЙКИ PAIDA
// ============================================================

const BRAND = 'Paida'
const BRAND_TAGLINE_ZH = '中国 → 独联体 卡车专线'
const BRAND_TAGLINE_RU = 'Автогрузы Китай → СНГ'

// --- Валюта ---
const CURRENCY = '$'

// --- Тарифы Paida: Китай → страны СНГ ---
// pricePerKg — USD за 1 кг оплачиваемого веса
// minKg      — минимальный оплачиваемый вес
// days       — срок доставки (диапазон)
const TARIFFS = {
  KZ: { pricePerKg: 1,    minKg: 100, days: '7-10',  nameRu: 'Казахстан',   nameZh: '哈萨克斯坦' },
  RU: { pricePerKg: 2,    minKg: 100, days: '15-20', nameRu: 'Россия',      nameZh: '俄罗斯' },
  UZ: { pricePerKg: 1.5,  minKg: 100, days: '10-14', nameRu: 'Узбекистан',  nameZh: '乌兹别克斯坦' },
  KG: { pricePerKg: 1.2,  minKg: 100, days: '8-12',  nameRu: 'Кыргызстан',  nameZh: '吉尔吉斯斯坦' },
  TJ: { pricePerKg: 1.6,  minKg: 100, days: '12-16', nameRu: 'Таджикистан', nameZh: '塔吉克斯坦' },
  BY: { pricePerKg: 2.3,  minKg: 100, days: '18-25', nameRu: 'Беларусь',    nameZh: '白俄罗斯' },
  AM: { pricePerKg: 2.2,  minKg: 100, days: '18-25', nameRu: 'Армения',     nameZh: '亚美尼亚' },
  AZ: { pricePerKg: 2,    minKg: 100, days: '15-22', nameRu: 'Азербайджан', nameZh: '阿塞拜疆' }
}

const COUNTRIES_ORDER = ['KZ', 'RU', 'UZ', 'KG', 'TJ', 'BY', 'AM', 'AZ']
const VOLUME_TO_KG = 250
const BORDER_FEE = 70

module.exports = {
  BRAND,
  BRAND_TAGLINE_ZH,
  BRAND_TAGLINE_RU,
  CURRENCY,
  TARIFFS,
  COUNTRIES_ORDER,
  VOLUME_TO_KG,
  BORDER_FEE
}

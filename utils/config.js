// ============================================================
//  НАСТРОЙКИ PAIDA
// ============================================================

const BRAND = 'Paida'
const BRAND_TAGLINE_ZH = '中国 → 独联体 卡车专线'
const BRAND_TAGLINE_RU = 'Автогрузы Китай → СНГ'

// --- Telegram (уведомления менеджеру) ---
const TG_BOT_TOKEN = 'PASTE_YOUR_BOT_TOKEN_HERE'
const TG_MANAGER_CHAT_IDS = ['PASTE_YOUR_CHAT_ID_HERE']

// --- Валюта ---
const CURRENCY = '¥'

// --- Тарифы Paida: Китай → страны СНГ ---
// pricePerKg — юань за 1 кг оплачиваемого веса
// minKg      — минимальный оплачиваемый вес
// days       — срок доставки (диапазон)
const TARIFFS = {
  KZ: { pricePerKg: 6,  minKg: 100, days: '7-10',  nameRu: 'Казахстан',   nameZh: '哈萨克斯坦' },
  RU: { pricePerKg: 14, minKg: 100, days: '15-20', nameRu: 'Россия',      nameZh: '俄罗斯' },
  UZ: { pricePerKg: 10, minKg: 100, days: '10-14', nameRu: 'Узбекистан',  nameZh: '乌兹别克斯坦' },
  KG: { pricePerKg: 8,  minKg: 100, days: '8-12',  nameRu: 'Кыргызстан',  nameZh: '吉尔吉斯斯坦' },
  TJ: { pricePerKg: 11, minKg: 100, days: '12-16', nameRu: 'Таджикистан', nameZh: '塔吉克斯坦' },
  BY: { pricePerKg: 16, minKg: 100, days: '18-25', nameRu: 'Беларусь',    nameZh: '白俄罗斯' },
  AM: { pricePerKg: 15, minKg: 100, days: '18-25', nameRu: 'Армения',     nameZh: '亚美尼亚' },
  AZ: { pricePerKg: 14, minKg: 100, days: '15-22', nameRu: 'Азербайджан', nameZh: '阿塞拜疆' }
}

const COUNTRIES_ORDER = ['KZ', 'RU', 'UZ', 'KG', 'TJ', 'BY', 'AM', 'AZ']
const VOLUME_TO_KG = 250
const BORDER_FEE = 500
const EXPRESS_MULTIPLIER = 1.3

module.exports = {
  BRAND,
  BRAND_TAGLINE_ZH,
  BRAND_TAGLINE_RU,
  TG_BOT_TOKEN,
  TG_MANAGER_CHAT_IDS,
  CURRENCY,
  TARIFFS,
  COUNTRIES_ORDER,
  VOLUME_TO_KG,
  BORDER_FEE,
  EXPRESS_MULTIPLIER
}

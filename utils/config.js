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

// --- Пункты пропуска на границе КНР ↔ ЦА ---
// coords: WGS84 (lat, lng) для отображения на карте
// avgQueueHours: усреднённое время очереди на прохождение таможни
//   (по оперативным данным центрально-азиатских экспедиторов 2026 г.)
// country: страна назначения, к которой относится пункт
// throughCountries: страны СНГ, куда попадают через этот пункт
const BORDER_CROSSINGS = [
  {
    code: 'KHORGOS',
    nameRu: 'Хоргос (СУАР — Алматинская обл.)',
    nameZh: '霍尔果斯口岸 (新疆 — 阿拉木图州)',
    coords: { lat: 44.2135, lng: 80.4136 },
    avgQueueHours: 8,
    throughCountries: ['KZ', 'KG', 'UZ', 'TJ']
  },
  {
    code: 'ALASHANKOU',
    nameRu: 'Алашанькоу — Достык',
    nameZh: '阿拉山口 — 多斯特克',
    coords: { lat: 45.1793, lng: 82.5647 },
    avgQueueHours: 6,
    throughCountries: ['KZ', 'RU']
  },
  {
    code: 'BAKHTY',
    nameRu: 'Бахты — Байкурты',
    nameZh: '巴克图 — 拜克尔特',
    coords: { lat: 46.6800, lng: 82.9000 },
    avgQueueHours: 10,
    throughCountries: ['KZ', 'RU']
  },
  {
    code: 'TORUGART',
    nameRu: 'Торугарт (СУАР — Нарын)',
    nameZh: '吐尔尕特口岸 (新疆 — 纳伦州)',
    coords: { lat: 40.6000, lng: 75.4000 },
    avgQueueHours: 12,
    throughCountries: ['KG', 'UZ']
  },
  {
    code: 'IRKESHTAM',
    nameRu: 'Иркештам (СУАР — Ош)',
    nameZh: '伊尔克什坦口岸 (新疆 — 奥什)',
    coords: { lat: 39.6900, lng: 74.8500 },
    avgQueueHours: 10,
    throughCountries: ['KG', 'UZ', 'TJ']
  }
]

// Приблизительные расстояния (км) от популярных китайских городов
// до пункта пропуска — для оценки времени в пути. Ключи в нижнем регистре,
// поддерживаем rus/eng/пиньинь варианты через нормализацию.
const CITY_TO_BORDER_KM = {
  'urumqi':    { KHORGOS: 620,  ALASHANKOU: 460, BAKHTY: 700, TORUGART: 1400, IRKESHTAM: 1500 },
  '乌鲁木齐':   { KHORGOS: 620,  ALASHANKOU: 460, BAKHTY: 700, TORUGART: 1400, IRKESHTAM: 1500 },
  'yiwu':      { KHORGOS: 4500, ALASHANKOU: 4400, BAKHTY: 4600, TORUGART: 5100, IRKESHTAM: 5200 },
  '义乌':       { KHORGOS: 4500, ALASHANKOU: 4400, BAKHTY: 4600, TORUGART: 5100, IRKESHTAM: 5200 },
  'guangzhou': { KHORGOS: 5200, ALASHANKOU: 5100, BAKHTY: 5300, TORUGART: 5700, IRKESHTAM: 5800 },
  '广州':       { KHORGOS: 5200, ALASHANKOU: 5100, BAKHTY: 5300, TORUGART: 5700, IRKESHTAM: 5800 },
  'kashgar':   { KHORGOS: 1600, ALASHANKOU: 1500, BAKHTY: 1700, TORUGART: 200,  IRKESHTAM: 260 },
  '喀什':       { KHORGOS: 1600, ALASHANKOU: 1500, BAKHTY: 1700, TORUGART: 200,  IRKESHTAM: 260 }
}

// Расстояние (км) от пункта пропуска до города назначения (по СНГ)
const BORDER_TO_CITY_KM = {
  KHORGOS:    { 'almaty': 380, 'алматы': 380, 'astana': 1600, 'астана': 1600, 'bishkek': 800, 'бишкек': 800, 'tashkent': 1400, 'ташкент': 1400 },
  ALASHANKOU: { 'almaty': 550, 'алматы': 550, 'astana': 1400, 'астана': 1400, 'moscow': 4300, 'москва': 4300 },
  BAKHTY:     { 'almaty': 800, 'алматы': 800, 'astana': 950,  'астана': 950,  'semey': 200,   'семей': 200 },
  TORUGART:   { 'bishkek': 550, 'бишкек': 550, 'osh': 800, 'ош': 800 },
  IRKESHTAM:  { 'osh': 260,     'ош': 260,     'bishkek': 900, 'бишкек': 900, 'tashkent': 700, 'ташкент': 700 }
}

// Дальность в километрах, которую грузовик проходит за сутки
const KM_PER_DAY = 550

module.exports = {
  BRAND,
  BRAND_TAGLINE_ZH,
  BRAND_TAGLINE_RU,
  CURRENCY,
  TARIFFS,
  COUNTRIES_ORDER,
  VOLUME_TO_KG,
  BORDER_FEE,
  BORDER_CROSSINGS,
  CITY_TO_BORDER_KM,
  BORDER_TO_CITY_KM,
  KM_PER_DAY
}

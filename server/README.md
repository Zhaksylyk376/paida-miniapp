# Paida API · Cloudflare Worker

Бэкенд для мини-программы Paida: один Worker, база D1 (SQLite),
хранилище R2 для документов. Всё бесплатно на free tier для MVP.

## Что тут

```
server/
  wrangler.toml        ← конфиг Worker'а (D1 + R2 биндинги)
  package.json         ← зависимости (hono, wrangler)
  schema.sql           ← схема БД (4 таблицы)
  src/index.js         ← весь бэкенд (18 actions + upload + serve)
```

Endpoints:
- `POST /api/paida` — единый диспетчер по `action` в body
- `POST /api/upload` — multipart, кладёт в R2, возвращает `fileID`
- `GET /uploads/<key>` — отдаёт файл из R2

## Первичный деплой

Один раз, минут 15.

### 1. Установить wrangler и залогиниться

```bash
cd server
npm install
npx wrangler login   # откроется браузер → согласиться в Cloudflare
```

Если аккаунта в Cloudflare нет — зарегистрируйся на dash.cloudflare.com
(free tier, без карты).

### 2. Создать D1 базу

```bash
npx wrangler d1 create paida
```

Wrangler выведет что-то вроде:
```
[[d1_databases]]
binding = "DB"
database_name = "paida"
database_id = "abcd1234-5678-..."
```

**Скопируй `database_id`** и вставь в `wrangler.toml` вместо
`REPLACE_WITH_D1_ID`.

### 3. Применить схему

```bash
npm run db:init
```

(это выполнит `schema.sql` на удалённой D1)

### 4. Создать R2-бакет

```bash
npx wrangler r2 bucket create paida-uploads
```

Имя должно совпадать с `bucket_name` в `wrangler.toml` (уже `paida-uploads`).

### 5. Прописать админов

Токены админов = device-uuid тех, кто должен одобрять водителей.
Своё uuid узнаешь так:

1. Задеплой Worker (шаг 6).
2. Открой мини-программу в DevTools → на любом экране появится сетевой
   запрос к `/api/paida` — в заголовке `Authorization: Bearer <твой-uuid>`.
3. Скопируй uuid.

Пропиши в secret:
```bash
npx wrangler secret put ADMIN_TOKENS
# в промпте вставь uuid (или несколько через запятую)
```

Либо для локальной разработки положи в файл `server/.dev.vars`:
```
ADMIN_TOKENS=твой-uuid,ещё-один-uuid
```

### 6. Деплой

```bash
npm run deploy
```

Wrangler выведет URL Worker'а: что-то вроде
`https://paida-api.<ваш-subdomain>.workers.dev`

### 7. Подключить фронт

Открой `utils/api.js` (в корне проекта, не в `server/`), найди:
```js
const API_BASE = ''
```
Вставь свой URL:
```js
const API_BASE = 'https://paida-api.<ваш-subdomain>.workers.dev'
```

### 8. Whitelist домена (для реальных телефонов)

Если публикуешь в WeChat на настоящем AppID — зайди на
[mp.weixin.qq.com](https://mp.weixin.qq.com) → 开发管理 → 服务器域名 →
добавь URL в `request` и `uploadFile`.

В DevTools для теста — сними галку `URL校验` в 详情 → 本地设置
(тогда домен-whitelist игнорируется).

## Локальная разработка

```bash
cd server
npm run db:init:local    # применить схему на локальную D1
npm run dev              # wrangler dev, слушает на http://127.0.0.1:8787
```

В `utils/api.js` временно поставь `API_BASE = 'http://127.0.0.1:8787'`
(и не забудь снять галку `URL校验` в DevTools).

## Полезные команды

```bash
# Посмотреть данные в D1 напрямую
npx wrangler d1 execute paida --remote --command "SELECT * FROM orders LIMIT 10"

# Посмотреть файлы в R2
npx wrangler r2 object list paida-uploads

# Логи Worker'а в реальном времени
npx wrangler tail
```

## Стоимость

Всё в бесплатных лимитах:
- **Workers**: 100 000 запросов/день бесплатно
- **D1**: 5 ГБ хранения + 5 млн read/день + 100k write/день бесплатно
- **R2**: 10 ГБ хранения + 1 млн операций A + 10 млн операций B бесплатно (нет egress fees)

Для Paida-MVP этого хватит с большим запасом.

## Что дальше (когда MVP взлетит)

- Заменить device-token auth на что-то нормальное (JWT + refresh или WeChat login через партнёрский AppID)
- Настроить Cloudflare Rate Limiting (защита от спама заказов)
- Прикрутить внешние API верификации (法大大 / НУЦ РК) для KYC/подписи
- Добавить push-уведомления через WeChat Subscribe Message (тоже нужен AppID)

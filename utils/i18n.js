const DEFAULT_LANG = 'zh'
const SUPPORTED = ['zh', 'ru']
const STORAGE_KEY = 'app_lang'
const ROLE_KEY = 'app_role'
const SUPPORTED_ROLES = ['client', 'driver']
const DEFAULT_ROLE = 'client'

const dict = {
  zh: {
    brand: 'Paida',
    brand_full: 'Paida · 中国到独联体卡车专线',

    // Roles
    role_client: '客户',
    role_driver: '司机',
    role_switch: '角色',
    role_toast_client: '已切换为客户模式',
    role_toast_driver: '已切换为司机模式',

    // TabBar — client / driver
    tab_home: '首页',
    tab_tracking: '流程',
    tab_order: '下单',
    tab_about: '关于',
    tab_home_d: '首页',
    tab_add_load: '添加运单',
    tab_my_loads: '我的运单',
    tab_about_d: '我的',

    // ================ CLIENT: INDEX ================
    nav_home: '首页',
    hero_title: 'Paida · 卡车专线',
    hero_subtitle: '中国出发，直达独联体 8 国。透明价格，专属司机，全程可控。',
    hero_btn_calc: '立即报价',
    hero_btn_how: '了解流程',

    // Stats bar
    stats_countries: '国家',
    stats_countries_val: '8',
    stats_days_min: '最短',
    stats_days_min_val: '7 天',
    stats_own: '自有',
    stats_own_val: 'KamAZ',

    // How it works
    how_title: '4 步完成运输',
    how_subtitle: '从下单到签收，Paida 全程为您把控',
    how_1_title: '在线报价',
    how_1_desc: '选择目的国家，输入重量或体积，即时计算运费',
    how_2_title: '匹配司机',
    how_2_desc: '系统在 Paida 认证的司机中挑选合适的车辆',
    how_3_title: '生成协议',
    how_3_desc: '客户和司机双方数据一键生成运输协议',
    how_4_title: '实时更新',
    how_4_desc: '装货、发车、过境、送达 — 每一步都有通知',

    // Clients
    clients_title: '为谁服务',
    client_private: '私人客户',
    client_private_desc: '中国淘货、个人包裹、家具、家电，专业司机送到您家',
    client_business: '中国出口商',
    client_business_desc: '批发发货、稳定专线、支持代收货款和货物集运',

    // Advantages
    advantages_title: '为什么选择 Paida',
    adv1_title: '独联体 8 国全覆盖',
    adv1_desc: '哈萨克斯坦 · 俄罗斯 · 乌兹别克斯坦 · 吉尔吉斯斯坦 · 塔吉克斯坦 · 白俄罗斯 · 亚美尼亚 · 阿塞拜疆',
    adv2_title: 'KamAZ 认证司机网络',
    adv2_desc: '所有司机都经过 Paida 审核。您可以看到司机的姓名、车牌、驾驶证信息',
    adv3_title: '透明的价格',
    adv3_desc: '在小程序内直接计算，包含运费、边境清关费。无隐藏费用',
    adv4_title: '快速协议',
    adv4_desc: '订单确认后自动生成双语运输协议。无需纸质合同',
    adv5_title: '双语沟通',
    adv5_desc: '中文和俄文两种语言。中国客户、独联体司机都能自由沟通',

    footer_note: '© 2026 Paida · 中哈跨境物流平台',

    // ================ CLIENT: TRACKING → PROCESS ================
    nav_process: '运输流程',
    process_title: '您的货物是如何运输的',
    process_subtitle: '透明的四阶段流程，每一步都可查询',

    process_1_title: '1. 报价与下单',
    process_1_desc: '在"下单"页填写货物信息，系统自动计算价格。您可以选择是否加急。提交后订单进入 Paida 分单系统。',

    process_2_title: '2. 匹配司机与协议',
    process_2_desc: 'Paida 从认证司机池中挑选合适的车辆。司机接单后，系统自动生成双方数据的运输协议，您会看到司机姓名、电话、车牌号码。',

    process_3_title: '3. 装货与运输',
    process_3_desc: '司机在中国仓库装货，出发后每个关键节点（发车、过霍尔果斯、进入目的国）都会自动通知您。',

    process_4_title: '4. 送达与签收',
    process_4_desc: '货物送达指定地址后，司机在小程序内标记为"已送达"，您会立即收到确认通知。',

    process_note: '所有沟通、状态、协议都保存在您的账户中',

    // ================ CLIENT: ORDER FORM ================
    nav_order: '在线下单',
    order_title: '在线下单',
    order_subtitle: '完整填写后，Paida 将在 30 分钟内匹配司机',
    order_client_type: '您的身份',
    order_client_private: '私人客户',
    order_client_business: '中国出口商',
    order_from: '中国发货城市 *',
    order_from_ph: '例如: 义乌、广州、深圳',
    order_to: '目的城市',
    order_to_ph: '例如: 阿拉木图、莫斯科、塔什干',
    order_goods: '货物类型',
    order_goods_ph: '例如: 服装、家电、机械配件',
    order_weight: '重量 (kg)',
    order_volume: '体积 (m³)',
    order_name: '您的姓名 *',
    order_name_ph: '联系人',
    order_phone: '手机号 *',
    order_phone_ph: '+7 / +86 / +998 ...',
    order_note: '备注',
    order_note_ph: '货物特性、装卸要求（可选）',
    order_submit: '提交订单',
    order_toast_required: '请填写标 * 的字段',
    order_toast_phone: '手机号格式错误',
    order_success_title: '订单已收到',
    order_success_msg: '订单编号已生成。Paida 分单员将在 30 分钟内匹配司机，并通过 WeChat 联系您。',
    order_success_btn: '好的',

    // Calculator
    calc_country: '目的国家 *',
    calc_country_ph: '请选择国家',
    calc_express: '加急运输（缩短 30% 时间，+30% 价格）',
    calc_price_label: '预估运费',
    calc_price_hint: '选择目的国家和输入重量后即可查看价格',
    calc_chargeable: '计费重量',
    calc_kg: 'kg',
    calc_base: '基本运费',
    calc_border: '边境清关费',
    calc_extra: '加急附加费',
    calc_days: '预计运输',
    calc_days_unit: '天',
    calc_disclaimer: '* 最终价格根据实际货物特性和路况可能有小幅调整',

    // ================ DRIVER: HOME ================
    d_home_welcome: '欢迎回来',
    d_home_stats_active: '进行中',
    d_home_stats_done: '已完成',
    d_home_stats_month: '本月赚取',
    d_home_notregistered_title: '成为 Paida 认证司机',
    d_home_notregistered_desc: '提交您的姓名、车辆信息和驾驶证。Paida 团队将在 24 小时内审核。审核通过后即可开始接单',
    d_home_register: '开始注册',
    d_home_pending_title: '资料审核中',
    d_home_pending_desc: 'Paida 管理员正在审核您的资料。预计 24 小时内完成，请留意 WeChat 消息',
    d_home_approved_hint: '在"添加运单"输入分单员发给您的运单号即可接单',
    d_home_quick_add: '添加新运单',
    d_home_quick_view: '查看我的运单',

    // Driver registration
    nav_d_register: 'Paida 司机注册',
    d_reg_title: 'Paida 司机注册',
    d_reg_subtitle: '完成注册后即可接单。所有数据仅用于 Paida 内部审核',
    d_reg_fullname: '姓名 *',
    d_reg_fullname_ph: '身份证或护照上的完整姓名',
    d_reg_phone: '手机号 *',
    d_reg_phone_ph: '+7 / +86 / +998 ...',
    d_reg_wechat: 'WeChat ID',
    d_reg_wechat_ph: '客户联系您时使用',
    d_reg_truck: '车辆型号 *',
    d_reg_truck_ph: '例如: KamAZ 5490、KamAZ 65207',
    d_reg_plate: '车牌号 *',
    d_reg_plate_ph: '完整车牌',
    d_reg_license: '驾驶证号',
    d_reg_license_ph: '驾驶证号码',
    d_reg_route: '主要行驶方向',
    d_reg_route_ph: '例如: 义乌 → 阿拉木图、乌鲁木齐 → 莫斯科',
    d_reg_submit: '提交审核',
    d_reg_success_title: '资料已提交',
    d_reg_success_msg: 'Paida 团队将在 24 小时内审核您的申请。审核结果通过 WeChat 通知您。',
    d_reg_ok: '知道了',

    // Add load
    nav_add_load: '添加运单',
    add_load_title: '添加新运单',
    add_load_subtitle: 'Paida 分单员告诉您运单号后，在此录入即可',
    add_load_number: '运单号 *',
    add_load_number_ph: '例如: PAIDA-A7B3',
    add_load_country: '目的国家',
    add_load_route: '路线（起点 → 终点）*',
    add_load_route_ph: '例如: 义乌 → 阿拉木图',
    add_load_client: '客户信息',
    add_load_client_ph: '客户姓名和电话（用于联系）',
    add_load_client_wechat: '客户 WeChat',
    add_load_client_wechat_ph: '客户 WeChat ID',
    add_load_price: '运费 (¥)',
    add_load_note: '货物备注',
    add_load_note_ph: '货物特性、装卸要求',
    add_load_submit: '添加到我的运单',
    add_load_toast_required: '请填写运单号和路线',
    add_load_success: '运单已添加',

    // My loads
    nav_my_loads: '我的运单',
    my_loads_title: '我的运单',
    my_loads_empty: '还没有运单。请在"添加运单"页录入分单员发给您的运单号',
    my_loads_active: '进行中',
    my_loads_done: '已完成',
    my_loads_delete: '删除',
    my_loads_delete_confirm: '确定要删除这个运单吗？该操作无法撤销',
    my_loads_delete_yes: '删除',
    my_loads_delete_no: '取消',
    my_loads_open: '查看详情',

    status_new: '新单',
    status_loaded: '已装货',
    status_in_transit: '运输中',
    status_at_border: '边境',
    status_delivered: '已送达',
    status_update_success: '状态已更新，Paida 将通知客户',
    status_update_next: '标记为',

    // Load detail / contract
    nav_contract: '运输协议',
    contract_title: 'Paida 运输协议',
    contract_number: '运单号',
    contract_route: '路线',
    contract_client_section: '客户',
    contract_driver_section: '司机',
    contract_cargo_section: '货物',
    contract_status_section: '状态历史',
    contract_price: '运费',
    contract_actions: '操作',
    contract_call: '📞 拨打客户电话',
    contract_wechat: '💬 复制客户 WeChat',
    contract_wechat_toast: 'WeChat ID 已复制',
    contract_next_status: '标记下一步状态',
    contract_no_client_phone: '未记录客户电话',
    contract_no_client_wechat: '未记录客户 WeChat',
    contract_generated: '协议生成于',

    // ================ ABOUT ================
    nav_about: '关于 Paida',
    nav_about_d: '我的资料',
    about_title: '关于 Paida',
    about_text: 'Paida 是连接中国和独联体的卡车物流平台。我们把有货要发的中国出口商和私人客户，与拥有 KamAZ 卡车的司机直接连接。客户通过小程序在线报价、下单、跟踪。司机通过同一个小程序接单、更新状态、与客户直接沟通。所有环节透明，所有数据在您的手中。',
    about_lang: '语言 · Язык',
    about_lang_zh: '中文',
    about_lang_ru: 'Русский',
    about_toast_lang_changed: '已切换为中文',
    d_profile_title: '我的资料',
    d_profile_edit: '修改资料',
    d_profile_logout: '切换为客户'
  },

  ru: {
    brand: 'Paida',
    brand_full: 'Paida · Автогрузы Китай → СНГ',

    role_client: 'Клиент',
    role_driver: 'Водитель',
    role_switch: 'Роль',
    role_toast_client: 'Режим клиента',
    role_toast_driver: 'Режим водителя',

    tab_home: 'Главная',
    tab_tracking: 'Как это работает',
    tab_order: 'Заявка',
    tab_about: 'О Paida',
    tab_home_d: 'Главная',
    tab_add_load: 'Добавить',
    tab_my_loads: 'Мои рейсы',
    tab_about_d: 'Профиль',

    // ================ CLIENT: INDEX ================
    nav_home: 'Главная',
    hero_title: 'Paida · Автогрузы',
    hero_subtitle: 'Из Китая напрямую в 8 стран СНГ. Прозрачная цена, проверенный водитель, полный контроль.',
    hero_btn_calc: 'Рассчитать доставку',
    hero_btn_how: 'Как это работает',

    stats_countries: 'стран СНГ',
    stats_countries_val: '8',
    stats_days_min: 'от',
    stats_days_min_val: '7 дней',
    stats_own: 'парк',
    stats_own_val: 'КамАЗ',

    how_title: 'Доставка за 4 шага',
    how_subtitle: 'От заявки до получения — Paida ведёт всё под ключ',
    how_1_title: 'Расчёт цены',
    how_1_desc: 'Выберите страну, введите вес или объём — калькулятор мгновенно покажет стоимость',
    how_2_title: 'Подбор водителя',
    how_2_desc: 'Paida находит проверенного водителя КамАЗа с подходящим маршрутом',
    how_3_title: 'Соглашение',
    how_3_desc: 'Автоматически создаётся протокол сделки со всеми данными сторон',
    how_4_title: 'Уведомления',
    how_4_desc: 'Загрузка, отправка, граница, доставка — вы получаете уведомление на каждом шаге',

    clients_title: 'Кому мы возим',
    client_private: 'Частные лица',
    client_private_desc: 'Личные покупки из Китая, посылки, мебель, техника — водитель доставит до двери',
    client_business: 'Компании из Китая',
    client_business_desc: 'Оптовые отгрузки, стабильные маршруты, консолидация грузов на складе в Китае',

    advantages_title: 'Почему Paida',
    adv1_title: '8 стран СНГ',
    adv1_desc: 'Казахстан · Россия · Узбекистан · Кыргызстан · Таджикистан · Беларусь · Армения · Азербайджан',
    adv2_title: 'Сеть проверенных водителей',
    adv2_desc: 'Каждый водитель прошёл верификацию Paida. Вы видите ФИО, номер машины, водительское',
    adv3_title: 'Прозрачные цены',
    adv3_desc: 'Расчёт прямо в приложении: тариф, таможня, экспресс. Без скрытых доплат',
    adv4_title: 'Быстрое соглашение',
    adv4_desc: 'После подтверждения заявки — автоматический договор на двух языках. Без бумажной волокиты',
    adv5_title: 'Два языка',
    adv5_desc: 'Китайский и русский. Заказчик из Китая и водитель из СНГ понимают друг друга',

    footer_note: '© 2026 Paida · Платформа автогрузов Китай ↔ СНГ',

    // ================ CLIENT: PROCESS ================
    nav_process: 'Процесс доставки',
    process_title: 'Как проходит ваша доставка',
    process_subtitle: 'Прозрачный процесс из четырёх этапов — каждый шаг виден',

    process_1_title: '1. Расчёт и заявка',
    process_1_desc: 'Во вкладке «Заявка» вы заполняете информацию о грузе — калькулятор сразу покажет цену. При желании можно выбрать экспресс. После отправки заявка попадает в диспетчерскую Paida.',

    process_2_title: '2. Подбор водителя и соглашение',
    process_2_desc: 'Paida выбирает водителя из пула проверенных перевозчиков. Как только водитель принимает рейс, автоматически формируется соглашение с данными обеих сторон — вы получите ФИО, телефон и номер машины водителя.',

    process_3_title: '3. Загрузка и путь',
    process_3_desc: 'Водитель забирает груз со склада в Китае. На каждом ключевом этапе (выехал, прошёл Хоргос, въехал в страну назначения) вы получаете уведомление.',

    process_4_title: '4. Доставка и подтверждение',
    process_4_desc: 'После доставки по адресу водитель в приложении отмечает «Доставлен» — вы сразу получаете подтверждение.',

    process_note: 'Все сообщения, статусы и соглашения хранятся в вашем аккаунте',

    // ================ CLIENT: ORDER ================
    nav_order: 'Оформить заявку',
    order_title: 'Оформить заявку',
    order_subtitle: 'После заполнения Paida подберёт водителя в течение 30 минут',
    order_client_type: 'Ваш тип',
    order_client_private: 'Частное лицо',
    order_client_business: 'Компания из Китая',
    order_from: 'Город отправления (Китай) *',
    order_from_ph: 'Например: Иу, Гуанчжоу, Шэньчжэнь',
    order_to: 'Город назначения',
    order_to_ph: 'Например: Алматы, Москва, Ташкент',
    order_goods: 'Тип груза',
    order_goods_ph: 'Например: одежда, техника, запчасти',
    order_weight: 'Вес (кг)',
    order_volume: 'Объём (м³)',
    order_name: 'Ваше имя *',
    order_name_ph: 'Как к вам обращаться',
    order_phone: 'Телефон *',
    order_phone_ph: '+7 / +86 / +998 ...',
    order_note: 'Комментарий',
    order_note_ph: 'Особенности груза, требования к погрузке (необязательно)',
    order_submit: 'Отправить заявку',
    order_toast_required: 'Заполните все поля со звёздочкой',
    order_toast_phone: 'Неверный формат телефона',
    order_success_title: 'Заявка принята',
    order_success_msg: 'Номер заявки сгенерирован. Диспетчер Paida подберёт водителя в течение 30 минут и свяжется с вами в WeChat.',
    order_success_btn: 'Понятно',

    calc_country: 'Страна назначения *',
    calc_country_ph: 'Выберите страну',
    calc_express: 'Экспресс-доставка (быстрее на 30%, +30% к цене)',
    calc_price_label: 'Предварительная цена',
    calc_price_hint: 'Выберите страну и введите вес — покажем стоимость',
    calc_chargeable: 'Оплачиваемый вес',
    calc_kg: 'кг',
    calc_base: 'Тариф',
    calc_border: 'Таможня и граница',
    calc_extra: 'Надбавка за экспресс',
    calc_days: 'Срок доставки',
    calc_days_unit: 'дн.',
    calc_disclaimer: '* Финальная цена может немного отличаться в зависимости от характеристик груза',

    // ================ DRIVER: HOME ================
    d_home_welcome: 'С возвращением',
    d_home_stats_active: 'В работе',
    d_home_stats_done: 'Выполнено',
    d_home_stats_month: 'За месяц',
    d_home_notregistered_title: 'Станьте водителем Paida',
    d_home_notregistered_desc: 'Отправьте ФИО, данные автомобиля и водительского удостоверения. Команда Paida проверит и одобрит вашу заявку в течение 24 часов. После этого сможете принимать рейсы.',
    d_home_register: 'Начать регистрацию',
    d_home_pending_title: 'Проверяем данные',
    d_home_pending_desc: 'Администратор Paida рассматривает вашу анкету. Ожидайте — решение придёт в WeChat в течение 24 часов',
    d_home_approved_hint: 'Во вкладке «Добавить» вводите номер рейса, который прислал диспетчер',
    d_home_quick_add: 'Добавить рейс',
    d_home_quick_view: 'Мои рейсы',

    // Driver registration
    nav_d_register: 'Регистрация в Paida',
    d_reg_title: 'Регистрация водителя',
    d_reg_subtitle: 'После верификации сможете принимать заявки. Данные используются только для проверки Paida',
    d_reg_fullname: 'ФИО *',
    d_reg_fullname_ph: 'Как в удостоверении личности',
    d_reg_phone: 'Телефон *',
    d_reg_phone_ph: '+7 / +86 / +998 ...',
    d_reg_wechat: 'WeChat ID',
    d_reg_wechat_ph: 'Клиенты будут писать вам сюда',
    d_reg_truck: 'Модель автомобиля *',
    d_reg_truck_ph: 'Например: КамАЗ 5490, КамАЗ 65207',
    d_reg_plate: 'Гос. номер *',
    d_reg_plate_ph: 'Полный номер машины',
    d_reg_license: 'Водительское удостоверение',
    d_reg_license_ph: 'Серия и номер',
    d_reg_route: 'Основное направление',
    d_reg_route_ph: 'Например: Иу → Алматы, Урумчи → Москва',
    d_reg_submit: 'Отправить на проверку',
    d_reg_success_title: 'Анкета отправлена',
    d_reg_success_msg: 'Команда Paida рассмотрит вашу заявку в течение 24 часов. Ответ придёт в WeChat.',
    d_reg_ok: 'Понятно',

    // Add load
    nav_add_load: 'Добавить рейс',
    add_load_title: 'Добавить новый рейс',
    add_load_subtitle: 'Когда диспетчер Paida пришлёт номер рейса — впишите его здесь',
    add_load_number: 'Номер рейса *',
    add_load_number_ph: 'Например: PAIDA-A7B3',
    add_load_country: 'Страна назначения',
    add_load_route: 'Маршрут (откуда → куда) *',
    add_load_route_ph: 'Например: Иу → Алматы',
    add_load_client: 'Клиент',
    add_load_client_ph: 'Имя и телефон клиента',
    add_load_client_wechat: 'WeChat клиента',
    add_load_client_wechat_ph: 'WeChat ID клиента',
    add_load_price: 'Оплата (¥)',
    add_load_note: 'Комментарий по грузу',
    add_load_note_ph: 'Особенности груза, требования',
    add_load_submit: 'Добавить в мои рейсы',
    add_load_toast_required: 'Укажите номер рейса и маршрут',
    add_load_success: 'Рейс добавлен',

    // My loads
    nav_my_loads: 'Мои рейсы',
    my_loads_title: 'Мои рейсы',
    my_loads_empty: 'Нет рейсов. Добавьте номер рейса во вкладке «Добавить» после сообщения диспетчера',
    my_loads_active: 'В работе',
    my_loads_done: 'Выполнены',
    my_loads_delete: 'Удалить',
    my_loads_delete_confirm: 'Удалить этот рейс? Действие необратимо',
    my_loads_delete_yes: 'Удалить',
    my_loads_delete_no: 'Отмена',
    my_loads_open: 'Открыть',

    status_new: 'Новый',
    status_loaded: 'Загружен',
    status_in_transit: 'В пути',
    status_at_border: 'На границе',
    status_delivered: 'Доставлен',
    status_update_success: 'Статус обновлён — Paida уведомит клиента',
    status_update_next: 'Отметить как',

    // Contract
    nav_contract: 'Соглашение',
    contract_title: 'Соглашение Paida',
    contract_number: 'Номер рейса',
    contract_route: 'Маршрут',
    contract_client_section: 'Клиент',
    contract_driver_section: 'Водитель',
    contract_cargo_section: 'Груз',
    contract_status_section: 'История статусов',
    contract_price: 'Оплата',
    contract_actions: 'Действия',
    contract_call: '📞 Позвонить клиенту',
    contract_wechat: '💬 Скопировать WeChat клиента',
    contract_wechat_toast: 'WeChat скопирован',
    contract_next_status: 'Отметить следующий статус',
    contract_no_client_phone: 'Телефон клиента не указан',
    contract_no_client_wechat: 'WeChat клиента не указан',
    contract_generated: 'Соглашение создано',

    // ================ ABOUT ================
    nav_about: 'О Paida',
    nav_about_d: 'Мой профиль',
    about_title: 'О Paida',
    about_text: 'Paida — платформа автомобильных грузоперевозок между Китаем и странами СНГ. Мы напрямую соединяем китайских экспортёров и частных клиентов с водителями КамАЗов. Клиент через мини-приложение считает цену, оформляет заявку, отслеживает статус. Водитель через это же приложение принимает рейсы, обновляет статусы и связывается с клиентом. Всё прозрачно, все данные — у вас в руках.',
    about_lang: 'Язык · 语言',
    about_lang_zh: '中文',
    about_lang_ru: 'Русский',
    about_toast_lang_changed: 'Язык переключён',
    d_profile_title: 'Мой профиль',
    d_profile_edit: 'Изменить данные',
    d_profile_logout: 'Переключиться на клиента'
  }
}

function detectSystemLang() {
  try {
    const sys = wx.getSystemInfoSync().language || ''
    const lower = sys.toLowerCase()
    if (lower.startsWith('ru') || lower.startsWith('kk') || lower.startsWith('be') || lower.startsWith('uk') || lower.startsWith('uz')) return 'ru'
    if (lower.startsWith('zh')) return 'zh'
  } catch (e) {}
  return DEFAULT_LANG
}

function getLang() {
  const stored = wx.getStorageSync(STORAGE_KEY)
  if (SUPPORTED.includes(stored)) return stored
  const detected = detectSystemLang()
  wx.setStorageSync(STORAGE_KEY, detected)
  return detected
}

function setLang(lang) {
  if (!SUPPORTED.includes(lang)) return
  wx.setStorageSync(STORAGE_KEY, lang)
  applyTabBar(lang, getRole())
}

function getRole() {
  const stored = wx.getStorageSync(ROLE_KEY)
  return SUPPORTED_ROLES.includes(stored) ? stored : DEFAULT_ROLE
}

function setRole(role) {
  if (!SUPPORTED_ROLES.includes(role)) return
  wx.setStorageSync(ROLE_KEY, role)
  applyTabBar(getLang(), role)
}

function t(lang) {
  return dict[lang] || dict[DEFAULT_LANG]
}

function applyTabBar(lang, role) {
  const s = t(lang)
  const r = role || getRole()
  const items = r === 'driver'
    ? [
        { index: 0, text: s.tab_home_d },
        { index: 1, text: s.tab_add_load },
        { index: 2, text: s.tab_my_loads },
        { index: 3, text: s.tab_about_d }
      ]
    : [
        { index: 0, text: s.tab_home },
        { index: 1, text: s.tab_tracking },
        { index: 2, text: s.tab_order },
        { index: 3, text: s.tab_about }
      ]
  items.forEach(item => {
    wx.setTabBarItem({ index: item.index, text: item.text, fail: () => {} })
  })
}

module.exports = {
  getLang, setLang, t, applyTabBar, SUPPORTED,
  getRole, setRole, SUPPORTED_ROLES
}

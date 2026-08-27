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
    tab_available: '可接',
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
    adv5_desc: '中俄双语沟通 — 客户和独联体司机都能顺畅对话，无语言障碍',

    footer_note: '© 2026 Paida · 中哈跨境物流平台',

    // ================ CLIENT: TRACKING → PROCESS ================
    nav_process: '运输流程',
    process_title: '您的货物是如何运输的',
    process_subtitle: '透明的四阶段流程，每一步都可查询',

    process_1_title: '1. 报价与下单',
    process_1_desc: '在"下单"页填写货物信息，系统自动计算价格。提交后订单进入 Paida 分单系统。',

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
    order_subtitle: '填写货物信息，生成运输合同',
    order_from: '中国发货城市 *',
    order_from_ph: '例如: 义乌、广州、深圳、乌鲁木齐',
    order_to: '目的城市',
    order_to_ph: '例如: 阿拉木图、比什凯克、塔什干',
    order_border: '过境口岸',
    order_border_ph: '选择过境口岸',
    route_calculating: '正在计算路线…',
    route_distance: '距离',
    route_km: '公里',
    route_drive: '行车时间',
    route_days: '天',
    route_source: '数据来源',
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
    order_success_msg: '订单编号已生成。',
    order_success_btn: '好的',
    order_success_open: '打开协议',

    // Calculator
    calc_country: '目的国家 *',
    calc_country_ph: '请选择国家',
    calc_price_label: '预估运费',
    calc_price_hint: '选择目的国家和输入重量后即可查看价格',
    calc_chargeable: '计费重量',
    calc_kg: 'kg',
    calc_base: '基本运费',
    calc_border: '边境清关费',
    calc_days: '预计运输',
    calc_days_unit: '天',
    calc_disclaimer: '* 最终价格根据实际货物特性和路况可能有小幅调整',

    // ================ DRIVER: HOME ================
    d_home_welcome: '欢迎回来',
    d_home_stats_active: '进行中',
    d_home_stats_done: '已完成',
    d_home_stats_month: '本月赚取',
    d_home_notregistered_title: '成为 Paida 认证司机',
    d_home_notregistered_desc: '提交您的姓名、车辆信息和驾驶证。审核通过后即可开始接单',
    d_home_register: '开始注册',
    d_home_pending_title: '资料审核中',
    d_home_pending_desc: 'Paida 管理员正在审核您的资料',
    d_home_approved_hint: '在"可接"页浏览客户订单，选择合适的即可接单',
    d_home_quick_available: '查看可接订单',
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
    d_reg_success_msg: '资料已提交，等待 Paida 审核',
    d_reg_ok: '知道了',

    // Available orders (driver)
    nav_available_orders: '可接订单',
    available_title: '可接订单',
    available_subtitle: '客户已下单，等待司机接单',
    available_empty: '目前没有可接订单',
    available_take: '接单',
    available_take_confirm_title: '确认接单',
    available_take_confirm_msg: '接单后，此订单将进入您的"我的运单"',
    available_take_yes: '接单',
    available_take_no: '取消',
    available_take_success: '已接单',

    // My loads
    nav_my_loads: '我的运单',
    my_loads_title: '我的运单',
    my_loads_empty: '还没有运单。请在"可接订单"页查看开放的订单',
    my_loads_active: '进行中',
    my_loads_done: '已完成',
    my_loads_release: '取消接单',
    my_loads_release_confirm: '取消接单？订单将重新回到可接列表',
    my_loads_release_yes: '取消接单',
    my_loads_release_no: '返回',
    my_loads_open: '查看详情',

    status_new: '新单',
    status_taken: '已接单',
    status_released: '已取消',
    status_loaded: '已装货',
    status_in_transit: '运输中',
    status_at_border: '边境',
    status_delivered: '已送达',
    status_update_success: '状态已更新',
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
    contract_you_section: '您的下单',
    contract_awaiting_driver: '等待匹配司机',

    // Formal contract sections
    contract_header_title: 'Paida 运输合同',
    contract_from_date: '签订日期',
    contract_section_parties: '合同双方',
    contract_party_client: '甲方（托运人 / 客户）',
    contract_party_driver: '乙方（承运人 / 司机）',
    contract_section_subject: '合同标的',
    contract_subject_route: '运输路线',
    contract_cargo_type: '货物类型',
    contract_cargo_weight: '重量',
    contract_cargo_volume: '体积',
    contract_section_price: '运费与付款',
    contract_price_amount: '运费金额',
    contract_price_term: '交付期限',
    contract_days: '天',
    contract_section_obligations: '双方义务',
    contract_obl_client: '甲方按约定时间、地点交付货物；提供完整、真实的收货信息；按合同支付运费。',
    contract_obl_driver: '乙方按约定路线和期限完成运输；保证货物完整、安全送达；每个关键节点在 Paida 平台更新状态。',
    contract_section_liability: '违约责任',
    contract_liability_text: '任何一方未履行或未完全履行本合同义务的，另一方有权要求赔偿因此造成的损失，并依据所在国家法律向有管辖权的法院提起诉讼。本合同经甲乙双方在 Paida 平台上确认签署后即具有法律效力。',
    contract_platform_note: 'Paida 作为居间信息平台，负责撮合并记录本合同，但不是本运输合同的当事方。',
    contract_section_signatures: '签署',
    contract_sig_client: '甲方签署',
    contract_sig_driver: '乙方签署',
    contract_sig_not_yet: '对方尚未签署',
    contract_sig_accept: '确认并签署合同',
    contract_sig_accepted: '已签署',
    contract_sig_at: '于',
    contract_sig_toast: '合同已签署',
    contract_sig_need_profile: '请先完成司机注册',
    contract_sig_fingerprint: '签名指纹',
    contract_sig_legal_note: '本电子签名由 Paida 服务器基于 SHA-256 生成，包含双方 WeChat OpenID 及服务器时间戳，作为不可篡改的电子证据。合同版本',
    contract_section_timeline: '状态历史',
    contract_status_locked: '待您签署合同后即可开始运输',

    // ================ ABOUT ================
    nav_about: '关于 Paida',
    nav_about_d: '我的资料',
    about_title: '关于 Paida',
    about_text: 'Paida 是连接中国和独联体的卡车物流平台。我们把有货要发的商家和个人客户，与拥有 KamAZ 卡车的司机直接连接。客户通过小程序在线报价、下单、跟踪。司机通过同一个小程序接单、更新状态、与客户直接沟通。所有环节透明，所有数据在您的手中。',
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
    tab_available: 'Открытые',
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
    order_subtitle: 'Заполните груз — сгенерируем договор перевозки',
    order_from: 'Город отправления (Китай) *',
    order_from_ph: 'Например: Иу, Гуанчжоу, Урумчи',
    order_to: 'Город назначения',
    order_to_ph: 'Например: Алматы, Бишкек, Ташкент',
    order_border: 'Пункт пропуска',
    order_border_ph: 'Выберите пункт пропуска',
    route_calculating: 'Считаем маршрут…',
    route_distance: 'Расстояние',
    route_km: 'км',
    route_drive: 'В пути',
    route_days: 'дн.',
    route_source: 'Источник',
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
    order_success_msg: 'Номер заявки сгенерирован.',
    order_success_btn: 'Понятно',
    order_success_open: 'Открыть договор',

    calc_country: 'Страна назначения *',
    calc_country_ph: 'Выберите страну',
    calc_price_label: 'Предварительная цена',
    calc_price_hint: 'Выберите страну и введите вес — покажем стоимость',
    calc_chargeable: 'Оплачиваемый вес',
    calc_kg: 'кг',
    calc_base: 'Тариф',
    calc_border: 'Таможня и граница',
    calc_days: 'Срок доставки',
    calc_days_unit: 'дн.',
    calc_disclaimer: '* Финальная цена может немного отличаться в зависимости от характеристик груза',

    // ================ DRIVER: HOME ================
    d_home_welcome: 'С возвращением',
    d_home_stats_active: 'В работе',
    d_home_stats_done: 'Выполнено',
    d_home_stats_month: 'За месяц',
    d_home_notregistered_title: 'Станьте водителем Paida',
    d_home_notregistered_desc: 'Отправьте ФИО, данные автомобиля и водительского удостоверения. После одобрения сможете принимать рейсы.',
    d_home_register: 'Начать регистрацию',
    d_home_pending_title: 'Проверяем данные',
    d_home_pending_desc: 'Администратор Paida рассматривает вашу анкету',
    d_home_approved_hint: 'Смотрите заявки клиентов во вкладке «Открытые» — берите любую подходящую',
    d_home_quick_available: 'Открытые заявки',
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
    d_reg_success_msg: 'Анкета отправлена, ждите одобрения Paida',
    d_reg_ok: 'Понятно',

    // Available orders (driver)
    nav_available_orders: 'Открытые заявки',
    available_title: 'Открытые заявки',
    available_subtitle: 'Клиенты уже оформили заявки — вы можете взять любую',
    available_empty: 'Пока открытых заявок нет',
    available_take: 'Взять рейс',
    available_take_confirm_title: 'Взять этот рейс?',
    available_take_confirm_msg: 'Рейс попадёт в «Мои рейсы», клиент увидит вас в договоре',
    available_take_yes: 'Взять',
    available_take_no: 'Отмена',
    available_take_success: 'Рейс принят',

    // My loads
    nav_my_loads: 'Мои рейсы',
    my_loads_title: 'Мои рейсы',
    my_loads_empty: 'Нет рейсов. Загляните во вкладку «Открытые заявки»',
    my_loads_active: 'В работе',
    my_loads_done: 'Выполнены',
    my_loads_release: 'Отказаться от рейса',
    my_loads_release_confirm: 'Отказаться от рейса? Он вернётся в список открытых',
    my_loads_release_yes: 'Отказаться',
    my_loads_release_no: 'Назад',
    my_loads_open: 'Открыть',

    status_new: 'Новая',
    status_taken: 'Принята',
    status_released: 'Отменена водителем',
    status_loaded: 'Загружен',
    status_in_transit: 'В пути',
    status_at_border: 'На границе',
    status_delivered: 'Доставлен',
    status_update_success: 'Статус обновлён',
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
    contract_you_section: 'Ваша заявка',
    contract_awaiting_driver: 'Ожидаем подбор водителя',

    // Formal contract sections
    contract_header_title: 'Договор перевозки Paida',
    contract_from_date: 'Дата',
    contract_section_parties: 'Стороны договора',
    contract_party_client: 'Заказчик (грузоотправитель)',
    contract_party_driver: 'Перевозчик (водитель)',
    contract_section_subject: 'Предмет договора',
    contract_subject_route: 'Маршрут перевозки',
    contract_cargo_type: 'Тип груза',
    contract_cargo_weight: 'Вес',
    contract_cargo_volume: 'Объём',
    contract_section_price: 'Стоимость и оплата',
    contract_price_amount: 'Сумма',
    contract_price_term: 'Срок доставки',
    contract_days: 'дн.',
    contract_section_obligations: 'Обязательства сторон',
    contract_obl_client: 'Заказчик передаёт груз в согласованном месте и в срок; предоставляет полные и достоверные данные получателя; оплачивает перевозку по договору.',
    contract_obl_driver: 'Перевозчик выполняет маршрут в срок; сохраняет целостность груза; отмечает каждый ключевой этап (загрузка, отправка, граница, доставка) в Paida.',
    contract_section_liability: 'Ответственность за нарушение',
    contract_liability_text: 'В случае неисполнения или ненадлежащего исполнения одной из сторон обязательств по настоящему договору другая сторона вправе требовать возмещения причинённых убытков и обратиться в суд в порядке, установленном законодательством страны рассмотрения спора. Настоящий договор приобретает юридическую силу с момента подтверждения обеими сторонами на платформе Paida.',
    contract_platform_note: 'Paida выступает как информационная площадка, которая сводит стороны и фиксирует договор, но не является стороной договора перевозки.',
    contract_section_signatures: 'Подписи сторон',
    contract_sig_client: 'Подпись заказчика',
    contract_sig_driver: 'Подпись перевозчика',
    contract_sig_not_yet: 'Другая сторона ещё не подписала',
    contract_sig_accept: 'Подтвердить и подписать',
    contract_sig_accepted: 'Подписано',
    contract_sig_at: 'в',
    contract_sig_toast: 'Договор подписан',
    contract_sig_need_profile: 'Сначала пройдите регистрацию водителя',
    contract_sig_fingerprint: 'Хэш подписи',
    contract_sig_legal_note: 'Электронная подпись сформирована сервером Paida по алгоритму SHA-256 и включает WeChat OpenID обеих сторон и серверную метку времени. Это фиксирует момент подписания и делает подмену документа технически невозможной. Версия договора',
    contract_section_timeline: 'История статусов',
    contract_status_locked: 'Начнёте перевозку после того, как подпишете договор',

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

// ================================================================
//  ДОПОЛНИТЕЛЬНЫЕ КЛЮЧИ (облачная версия): документы, статусы анкеты,
//  отклики, выбор водителя, админка. Мержим в основной словарь.
// ================================================================
Object.assign(dict.zh, {
  // Документы при регистрации
  d_reg_docs_title: '证件（必填）',
  d_reg_docs_hint: '请上传清晰照片，用于 Paida 审核',
  d_doc_techpassport: '行驶证 / 车辆登记证',
  d_doc_license: '驾驶证',
  d_doc_carphoto: '车辆照片',
  d_doc_upload: '上传照片',
  d_doc_replace: '重新上传',
  d_doc_uploaded: '已上传',
  d_reg_checking: '正在提交并自动检查…',

  // Автопроверки — сообщения об ошибках
  err_VALIDATION: '请检查必填项和证件',
  err_DUP_PLATE: '该车牌已被其他司机注册',
  err_DUP_PHONE: '该手机号已被其他司机注册',
  err_NETWORK: '无法连接服务器',
  err_generic: '发生错误',

  // Статус анкеты водителя
  drv_status_pending: '审核中',
  drv_status_approved: '已通过',
  drv_status_rejected: '未通过',
  drv_gate_pending_title: '资料审核中',
  drv_gate_pending_msg: 'Paida 正在核对您的证件，通过后即可接单',
  drv_gate_rejected_title: '审核未通过',
  drv_gate_none_title: '请先完成司机注册',
  drv_gate_reregister: '重新提交资料',
  drv_gate_register: '去注册',

  // Отклики (водитель)
  apply_btn: '申请接单',
  apply_applied: '已申请',
  apply_success: '已提交申请，等待客户选择',
  apply_msg_ph: '给客户留言（可选）',

  // Отклики (клиент выбирает)
  nav_applications: '选择司机',
  apps_title: '申请的司机',
  apps_empty: '还没有司机申请',
  apps_choose: '选择该司机',
  apps_choose_confirm: '确认选择这位司机？',
  apps_chosen_toast: '已选择司机，正在生成合同',
  apps_rating: '评分',
  apps_no_rating: '新司机',

  // Мои заказы (клиент): счётчик откликов
  order_apps_count: '位司机申请',
  order_view_apps: '查看并选择',
  order_open_contract: '查看合同',

  // Админ
  nav_admin: 'Paida 审核台',
  admin_title: '司机审核',
  admin_tab_pending: '待审核',
  admin_tab_approved: '已通过',
  admin_tab_rejected: '未通过',
  admin_empty: '没有记录',
  admin_view_doc: '查看',
  admin_approve: '通过',
  admin_reject: '拒绝',
  admin_reject_reason: '拒绝原因',
  admin_done: '已处理',
  admin_checks: '自动检查',
  admin_check_ok: '通过',
  admin_open_admin: '审核台',

  // Демо-режим
  demo_banner: '演示模式 · 云开发未配置，服务器功能不可用',

  // Стандартные оговорки
  contract_section_clauses: '标准条款',
  contract_clause_downtime_title: '车辆滞留',
  contract_clause_downtime_text: '运输车辆到达装货或卸货地点后，超出双方约定的 24（二十四）小时的等候时间，由甲方按每完整一日 50（伍拾）美元的标准向乙方支付滞留费。',
  contract_clause_customs_title: '海关延误',
  contract_clause_customs_text: '因甲方提供的货物单据不完整或不真实导致口岸清关延误的，由甲方按前述滞留费率承担费用。因不可抗力（海关规则变更、罢工、自然灾害等）导致的延误，双方均免除交付期限责任。因乙方原因（缺少通行证件、擅自改变约定路线）导致的延误，由乙方按甲方的实际损失予以赔偿。',
  contract_clause_damage_title: '货物损坏或灭失',
  contract_clause_damage_text: '货物全部灭失或损坏时，乙方按本合同中约定的货物申报金额向甲方赔偿损坏部分的价值；部分损坏的，按双方共同确认的损坏比例赔偿。如乙方能证明损失系因不可抗力、货物固有隐蔽缺陷或海关等国家机关行为所致，则免于赔偿责任。',

  // Арбитражная оговорка
  contract_section_arbitration: '争议解决',
  contract_arbitration_text: '凡因本合同引起或与本合同有关的一切争议，双方应首先在 30（叁拾）个日历日内通过友好协商解决。如协商不成，则提交双方共同承认的国际商事仲裁机构裁决：由中方当事人提起的，提交中国国际经济贸易仲裁委员会（CIETAC）仲裁；由哈方当事人提起的，提交阿斯塔纳国际金融中心（AIFC）国际仲裁中心仲裁。仲裁裁决为终局裁决，依据 1958 年《纽约公约》在两国境内均得到承认和执行。',

  // KYC клиента
  nav_kyc: '身份验证',
  kyc_title: '甲方身份验证',
  kyc_intro: '为使运输合同具备法律效力，需在签约前核验您的身份或企业信息。资料仅用于合同存证。',
  kyc_country: '国家 / 地区',
  kyc_country_cn: '中国',
  kyc_country_kz: '哈萨克斯坦',
  kyc_type: '主体类型',
  kyc_type_physical: '个人',
  kyc_type_legal: '法人（企业）',
  kyc_field_name_physical: '姓名（与证件一致）',
  kyc_field_name_legal: '企业名称（与执照一致）',
  kyc_field_id_cn_physical: '身份证号',
  kyc_field_id_cn_legal: '统一社会信用代码（营业执照）',
  kyc_field_id_kz_physical: 'ИИН (个人识别号)',
  kyc_field_id_kz_legal: 'БИН (企业识别号)',
  kyc_doc_title: '证件照片',
  kyc_doc_hint_cn_physical: '身份证正面清晰照片',
  kyc_doc_hint_cn_legal: '营业执照清晰照片',
  kyc_doc_hint_kz_physical: '身份证正面清晰照片',
  kyc_doc_hint_kz_legal: '国家注册文件清晰照片',
  kyc_submit: '提交验证',
  kyc_status_submitted: '已提交',
  kyc_status_approved: '已通过',
  kyc_status_rejected: '未通过',
  kyc_status_none: '未验证',
  kyc_change: '重新提交',
  kyc_success_title: '资料已提交',
  kyc_success_msg: '现在您可以签署运输合同了。Paida 将后台复核您的证件。',
  kyc_required_title: '需先完成身份验证',
  kyc_required_msg: '根据合同的法律效力要求，需在签署前提交身份或企业信息',
  kyc_go: '去验证',
  err_BAD_ID: '证件号码格式不正确',
  err_BAD_NAME: '请填写完整姓名或企业名称',
  err_DOC_REQUIRED: '请上传证件照片',
  err_DUP_ID: '该证件号已被其他账号绑定',
  err_KYC_REQUIRED: '请先完成身份验证',
  err_KYC_REJECTED: '身份验证未通过，请重新提交'
})

Object.assign(dict.ru, {
  // Документы при регистрации
  d_reg_docs_title: 'Документы (обязательно)',
  d_reg_docs_hint: 'Загрузите чёткие фото — они нужны для проверки Paida',
  d_doc_techpassport: 'Техпаспорт (СРТС)',
  d_doc_license: 'Водительское удостоверение',
  d_doc_carphoto: 'Фото автомобиля',
  d_doc_upload: 'Загрузить фото',
  d_doc_replace: 'Заменить',
  d_doc_uploaded: 'Загружено',
  d_reg_checking: 'Отправляем и проверяем…',

  // Автопроверки — сообщения об ошибках
  err_VALIDATION: 'Проверьте поля и документы',
  err_DUP_PLATE: 'Этот гос. номер уже зарегистрирован другим водителем',
  err_DUP_PHONE: 'Этот телефон уже зарегистрирован другим водителем',
  err_NETWORK: 'Нет связи с сервером',
  err_generic: 'Произошла ошибка',

  // Статус анкеты водителя
  drv_status_pending: 'На проверке',
  drv_status_approved: 'Одобрен',
  drv_status_rejected: 'Отклонён',
  drv_gate_pending_title: 'Анкета на проверке',
  drv_gate_pending_msg: 'Paida проверяет ваши документы. После одобрения вы сможете принимать заявки',
  drv_gate_rejected_title: 'Анкета отклонена',
  drv_gate_none_title: 'Сначала пройдите регистрацию водителя',
  drv_gate_reregister: 'Подать анкету заново',
  drv_gate_register: 'Зарегистрироваться',

  // Отклики (водитель)
  apply_btn: 'Откликнуться',
  apply_applied: 'Вы откликнулись',
  apply_success: 'Отклик отправлен, ждите выбора клиента',
  apply_msg_ph: 'Сообщение клиенту (необязательно)',

  // Отклики (клиент выбирает)
  nav_applications: 'Выбор водителя',
  apps_title: 'Откликнувшиеся водители',
  apps_empty: 'Пока никто не откликнулся',
  apps_choose: 'Выбрать этого водителя',
  apps_choose_confirm: 'Выбрать этого водителя?',
  apps_chosen_toast: 'Водитель выбран, формируем договор',
  apps_rating: 'Рейтинг',
  apps_no_rating: 'Новый водитель',

  // Мои заказы (клиент): счётчик откликов
  order_apps_count: 'откликов',
  order_view_apps: 'Посмотреть и выбрать',
  order_open_contract: 'Открыть договор',

  // Админ
  nav_admin: 'Проверка Paida',
  admin_title: 'Проверка водителей',
  admin_tab_pending: 'На проверке',
  admin_tab_approved: 'Одобрены',
  admin_tab_rejected: 'Отклонены',
  admin_empty: 'Нет записей',
  admin_view_doc: 'Открыть',
  admin_approve: 'Одобрить',
  admin_reject: 'Отклонить',
  admin_reject_reason: 'Причина отказа',
  admin_done: 'Обработано',
  admin_checks: 'Автопроверки',
  admin_check_ok: 'пройдено',
  admin_open_admin: 'Панель проверки',

  // Демо-режим
  demo_banner: 'Демо-режим · облако не подключено, серверные функции недоступны',

  // Стандартные оговорки
  contract_section_clauses: 'Стандартные оговорки',
  contract_clause_downtime_title: 'Простой транспорта',
  contract_clause_downtime_text: 'Простой транспортного средства сверх согласованных 24 (двадцати четырёх) часов с момента прибытия на место погрузки или выгрузки оплачивается заказчиком в размере 50 (пятидесяти) долларов США за каждые полные сутки простоя.',
  contract_clause_customs_title: 'Задержка на таможне',
  contract_clause_customs_text: 'Задержка на таможенном пункте пропуска, вызванная предоставлением заказчиком неполных или недостоверных документов на груз, оплачивается заказчиком по ставке простоя. Задержка вследствие форс-мажора (изменение таможенных правил, забастовки, стихийные бедствия) освобождает обе стороны от ответственности за срок доставки. Задержка по вине перевозчика (отсутствие разрешительных документов, нарушение согласованного маршрута) возмещается перевозчиком в размере фактических убытков заказчика.',
  contract_clause_damage_title: 'Повреждение или утрата груза',
  contract_clause_damage_text: 'При полной утрате или повреждении груза перевозчик возмещает заказчику стоимость поврежденной части груза по объявленной в настоящем договоре сумме. При частичном повреждении — пропорционально степени повреждения, подтверждённой актом обеих сторон. Перевозчик освобождается от ответственности, если докажет, что утрата или повреждение вызваны обстоятельствами, устранить которые он не мог: форс-мажор, скрытые дефекты груза, действия таможенных или иных государственных органов.',

  // Арбитражная оговорка
  contract_section_arbitration: 'Порядок разрешения споров',
  contract_arbitration_text: 'Все споры и разногласия, возникающие из настоящего договора или в связи с ним, стороны стремятся урегулировать путём переговоров в течение 30 (тридцати) календарных дней. При недостижении соглашения споры подлежат передаче на рассмотрение в международный коммерческий арбитраж, признаваемый обеими сторонами: Китайская международная экономическая и торговая арбитражная комиссия (CIETAC) — при инициировании со стороны китайского участника; Международный арбитражный центр AIFC (г. Астана) — при инициировании со стороны казахстанского участника. Арбитражное решение является окончательным и подлежит признанию и приведению в исполнение в соответствии с Нью-Йоркской конвенцией 1958 года на территории обеих стран.',

  // KYC клиента
  nav_kyc: 'Верификация личности',
  kyc_title: 'Верификация заказчика',
  kyc_intro: 'Для юридической силы договора перевозки нужно подтвердить вашу личность или данные компании. Данные используются только для фиксации договора.',
  kyc_country: 'Страна',
  kyc_country_cn: 'КНР',
  kyc_country_kz: 'Казахстан',
  kyc_type: 'Тип',
  kyc_type_physical: 'Физическое лицо',
  kyc_type_legal: 'Юридическое лицо',
  kyc_field_name_physical: 'ФИО (как в документе)',
  kyc_field_name_legal: 'Наименование организации',
  kyc_field_id_cn_physical: 'Номер 身份证',
  kyc_field_id_cn_legal: 'Единый код 营业执照 (USCC)',
  kyc_field_id_kz_physical: 'ИИН',
  kyc_field_id_kz_legal: 'БИН',
  kyc_doc_title: 'Фото документа',
  kyc_doc_hint_cn_physical: 'Чёткое фото лицевой стороны 身份证',
  kyc_doc_hint_cn_legal: 'Чёткое фото 营业执照',
  kyc_doc_hint_kz_physical: 'Чёткое фото удостоверения личности',
  kyc_doc_hint_kz_legal: 'Чёткое фото свидетельства о госрегистрации',
  kyc_submit: 'Отправить на верификацию',
  kyc_status_submitted: 'На проверке',
  kyc_status_approved: 'Одобрено',
  kyc_status_rejected: 'Отклонено',
  kyc_status_none: 'Не пройдена',
  kyc_change: 'Изменить данные',
  kyc_success_title: 'Данные отправлены',
  kyc_success_msg: 'Теперь вы можете подписать договор. Paida проверит документы в фоновом режиме.',
  kyc_required_title: 'Нужна верификация личности',
  kyc_required_msg: 'Для юридической силы договора необходимо пройти верификацию перед подписанием',
  kyc_go: 'Пройти верификацию',
  err_BAD_ID: 'Формат идентификатора не подходит для выбранного типа',
  err_BAD_NAME: 'Укажите ФИО или наименование',
  err_DOC_REQUIRED: 'Загрузите фото документа',
  err_DUP_ID: 'Этот идентификатор уже привязан к другому аккаунту',
  err_KYC_REQUIRED: 'Сначала пройдите верификацию личности',
  err_KYC_REJECTED: 'Верификация не пройдена, отправьте документы заново'
})

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
        { index: 1, text: s.tab_available },
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

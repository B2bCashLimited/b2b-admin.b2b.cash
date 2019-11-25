export const ROLES_LIST = [
  {
    'key': 'moderation',
    'label': 'moderationLabel',
    'type': 'admin',
    'roles': [
      'MODERATE_PRODUCTS_VIEW',
      'MODERATE_COMPANIES_VIEW',
      'MODERATE_PUMPING_VIEW',
      'MODERATE_ORDER',
      'MODERATE_RATING_VIEW',
      'MODERATE_ACTIVITIES_VIEW',
      'MODERATE_FREE_PERIOD',
    ]
  },
  {
    'key': 'users',
    'label': 'usersLabel',
    'type': 'admin',
    'roles': [
      'USERS_VIEW',
      'USERS_CREATE',
      'USERS_EDIT',
      'USERS_DELETE',
      'INDIVIDUAL_DELETE'
    ]
  },
  {
    'key': 'employees',
    'label': 'employeesLabel',
    'type': 'admin',
    'roles': [
      'EMPLOYEES_VIEW',
      'EMPLOYEES_CREATE',
      'EMPLOYEES_EDIT',
      'EMPLOYEES_DELETE',
    ]
  },
  {
    'key': 'formOrders',
    'label': 'formOrdersLabel',
    'type': 'admin',
    'roles': [
      'FORM_ORDERS_VIEW',
      'FORM_ORDERS_EDIT',
    ]
  },
  {
    'key': 'categoryFeatures',
    'label': 'categoryFeaturesLabel',
    'type': 'admin',
    'roles': [
      'CATEGORY_FEATURES_VIEW',
      'CATEGORY_FEATURES_EDIT',
      'CATEGORY_FEATURES_ADD',
      'CATEGORY_FEATURES_DELETE'
    ]
  },
  {
    'key': 'marketplaceFeatures',
    'label': 'marketplaceFeaturesLabel',
    'type': 'admin',
    'roles': [
      'VIEW_MARKETPLACES',
      'ADD_MARKETPLACES',
      'EDIT_MARKETPLACES',
      'DELETE_MARKETPLACES'
    ]
  },
  {
    'key': 'productCategories',
    'label': 'productCategoriesLabel',
    'type': 'admin',
    'roles': [
      'PRODUCT_CATEGORIES_VIEW',
      'PRODUCT_CATEGORIES_ADD',
      'PRODUCT_CATEGORIES_EDIT',
      'PRODUCT_CATEGORIES_DELETE'
    ]
  },
  {
    'key': 'units',
    'label': 'unitsLabel',
    'type': 'admin',
    'roles': [
      'UNITS_VIEW',
      'UNITS_ADD',
      'UNITS_EDIT',
      'UNITS_DELETE'

    ]
  },
  {
    'key': 'mailer',
    'label': 'mailerLabel',
    'type': 'admin',
    'roles': [
      'MAILER_VIEW',
      'MAILER_FULL_ACCESS'
    ]
  },
  {
    'key': 'statisticsAndAnalytics',
    'label': 'statisticsAndAnalyticsLabel',
    'type': 'sales',
    'roles': [
      'STATISTICS_AND_ANALYTICS_VIEW',
      'STATISTICS_AND_SHOWCASES_VIEW'
    ]
  },
  {
    'key': 'roles',
    'label': 'rolesLabel',
    'type': 'sales',
    'roles': [
      'ROLES_VIEW',
      'ROLES_CREATE',
      'ROLES_EDIT',
      'ROLES_DELETE'
    ]
  },
  {
    'key': 'chat',
    'label': 'chatLabel',
    'type': 'sales',
    'roles': [
      'CHAT_MANAGER_VIEW',
      'CHAT_CONSULTANT_VIEW',
      'CHAT_MANAGER_EDIT',
      'CHAT_CONSULTANT_SELLERS',
      'CHAT_CONSULTANT_BUYERS',
      'CHAT_CONSULTANT_GUESTS'
    ]
  },
  {
    'key': 'billing',
    'label': 'billingLabel',
    'type': 'sales',
    'roles': [
      'BILLING_VIEW',
      'BILLING_FULL_ACCESS_FOR_CUSTOMS_AND_DELIVERY',
      'BILLING_FULL_ACCESS_FOR_CUSTOMS',
      'BILLING_FULL_ACCESS_FOR_MANUFACTURERS',
      'BILLING_FULL_ACCESS_FOR_SUPPLIERS',
      'BILLING_FULL_ACCESS_FOR_TRADERS',
      'BILLING_FULL_ACCESS_FOR_COMPANIES',
      'MAKE_A_GIFT',
    ]
  },
  {
    'key': 'groups',
    'label': 'groupsLabel',
    'type': 'client',
    'roles': [
      'formOrders',
      'categoryFeatures',
      'productCategories',
      'marketplaceFeaturesLabel',
      'units',
      'moderation',
      'chat',
      'users',
      'mailer',
      'billing'
    ]
  },
  {
    'key': 'marketing',
    'label': 'marketingLabel',
    'type': 'admin',
    'roles': [
      'MARKETING_VIEW',
      'MANAGE_SEO'
    ]
  }
];

export const ROLES_LIST_VALUES = {
  'moderationLabel': 'Модерирование',
  'MODERATE_PRODUCTS_VIEW': 'Товары',
  'MODERATE_COMPANIES_VIEW': 'Компании',
  'MODERATE_PUMPING_VIEW': 'Прокачки',
  'MODERATE_ORDER': 'Актуализация заказов',
  'MODERATE_RATING_VIEW': 'Рейтинги',
  'MODERATE_ACTIVITIES_VIEW': 'Виды деятельности',
  'MODERATE_FREE_PERIOD': 'Бесплатный период',

  'usersLabel': 'Пользователи площадки',
  'USERS_VIEW': 'Просмотр',
  'USERS_CREATE': 'Создание',
  'USERS_EDIT': 'Редактирование',
  'USERS_DELETE': 'Удаление',
  'INDIVIDUAL_DELETE': 'Удаление физ. лиц',

  'marketplaceFeaturesLabel': 'Маркетплейсы',
  'VIEW_MARKETPLACES': 'Просмотр',
  'ADD_MARKETPLACES': 'Создание',
  'EDIT_MARKETPLACES': 'Редактирование',
  'DELETE_MARKETPLACES': 'Удаление',

  'employeesLabel': 'Сотрудники B2B',
  'EMPLOYEES_VIEW': 'Просмотр',
  'EMPLOYEES_CREATE': 'Создание',
  'EMPLOYEES_EDIT': 'Редактирование',
  'EMPLOYEES_DELETE': 'Удаление',

  'formOrdersLabel': 'Сформировать заказ',
  'FORM_ORDERS_VIEW': 'Просмотр',
  'FORM_ORDERS_EDIT': 'Редактирование',

  'categoryFeaturesLabel': 'Характеристики категорий',
  'CATEGORY_FEATURES_VIEW': 'Просмотр',
  'CATEGORY_FEATURES_EDIT': 'Редактирование',
  'CATEGORY_FEATURES_ADD': 'Добавление',
  'CATEGORY_FEATURES_DELETE': 'Удаление',

  'productCategoriesLabel': 'Категории товаров',
  'PRODUCT_CATEGORIES_VIEW': 'Просмотр',
  'PRODUCT_CATEGORIES_ADD': 'Создание',
  'PRODUCT_CATEGORIES_EDIT': 'Редактирование',
  'PRODUCT_CATEGORIES_DELETE': 'Удаление',

  'unitsLabel': 'Единицы измерения',
  'UNITS_VIEW': 'Просмотр',
  'UNITS_ADD': 'Добавление',
  'UNITS_EDIT': 'Редактирование',
  'UNITS_DELETE': 'Удаление',

  'mailerLabel': 'Рассыльщик писем',
  'MAILER_VIEW': 'Просмотр',
  'MAILER_FULL_ACCESS': 'Полные права',

  'statisticsAndAnalyticsLabel': 'Статистика/Аналитика',
  'STATISTICS_AND_ANALYTICS_VIEW': 'Просмотр статистики сделок и заказов',
  'STATISTICS_AND_SHOWCASES_VIEW': 'Просмотр статистики и аналитики витрин',

  'rolesLabel': 'Права доступа для сотрудников B2B',
  'ROLES_VIEW': 'Просмотр списка прав доступа, ролей и должностей',
  'ROLES_CREATE': 'Добавление новых должностей',
  'ROLES_EDIT': 'Редактирование прав доступа и должностей',
  'ROLES_DELETE': 'Удаление должностей',

  'chatLabel': 'Чаты',
  'CHAT_MANAGER_VIEW': 'Просмотр кабинета руководителя',
  'CHAT_CONSULTANT_VIEW': 'Просмотр кабинета консультанта',
  'CHAT_MANAGER_EDIT': 'Настройки системных чатов и количество консультантов',
  'CHAT_CONSULTANT_SELLERS': 'Ответ продавцам',
  'CHAT_CONSULTANT_BUYERS': 'Ответ покупатель',
  'CHAT_CONSULTANT_GUESTS': 'Ответ гостям',

  'billingLabel': 'Тарификация',
  'BILLING_VIEW': 'Просмотр тарификации',
  'BILLING_FULL_ACCESS_FOR_CUSTOMS_AND_DELIVERY': 'Полные права для Таможенной очистки и Доставки',
  'BILLING_FULL_ACCESS_FOR_CUSTOMS': 'Полные права для Таможенной очистки',
  'BILLING_FULL_ACCESS_FOR_MANUFACTURERS': 'Полные права для Заводов',
  'BILLING_FULL_ACCESS_FOR_SUPPLIERS': 'Полные права для Поставщиков',
  'BILLING_FULL_ACCESS_FOR_TRADERS': 'Полные права для Экспедиторов',
  'BILLING_FULL_ACCESS_FOR_COMPANIES': 'Полные права для Компаний',
  'MAKE_A_GIFT': 'Начисление бонусов',

  'groupsLabel': 'Комплексные права',
  'formOrders': 'Заказы',
  'categoryFeatures': 'Характеристики категорий',
  'marketplaceFeatures': 'Маркетплейсы',
  'productCategories': 'Категории товаров',
  'units': 'Единицы измерения',
  'moderation': 'Модерирование',
  'chat': 'Чаты',
  'users': 'Пользователи и роли',
  'mailer': 'Рассыльщик писем',
  'billing': 'Тарификация',

  'marketingLabel': 'Маркетинг',
  'MARKETING_VIEW': 'Экспортировать файл с фидом',
  'MANAGE_SEO': 'SEO'
};

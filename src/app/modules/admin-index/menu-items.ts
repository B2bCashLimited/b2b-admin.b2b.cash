import {Permissions} from '@b2b/enums';

export const MENU_ITEMS = [
  {
    url: '/form-orders',
    icon: 'shopping_cart',
    label: 'Сформировать заказ',
    permissions: [
      Permissions.SUPER_ADMIN,
      Permissions.FORM_ORDERS_VIEW,
    ]
  },
  {
    url: '/category-features',
    icon: 'list_alt',
    label: 'Характеристики категорий',
    permissions: [
      Permissions.SUPER_ADMIN,
      Permissions.CATEGORY_FEATURES_VIEW,
    ]
  },
  {
    url: '/product-categories',
    icon: 'assignment',
    label: 'Категории товаров',
    permissions: [
      Permissions.SUPER_ADMIN,
      Permissions.PRODUCT_CATEGORIES_VIEW,
    ]
  },
  {
    url: '/units',
    icon: 'settings_applications',
    label: 'Единицы измерения',
    permissions: [
      Permissions.SUPER_ADMIN,
      Permissions.UNITS_VIEW,
    ]
  },
  {
    url: null,
    icon: 'verified_user',
    label: 'Модерирование',
    permissions: [
      Permissions.SUPER_ADMIN,
      Permissions.MODERATE_PRODUCTS_VIEW,
      Permissions.MODERATE_COMPANIES_VIEW,
      Permissions.MODERATE_PUMPING_VIEW,
      Permissions.MODERATE_ORDER,
      Permissions.MODERATE_RATING_VIEW,
      Permissions.MODERATE_ACTIVITIES_VIEW,
    ],
    children: [
      {
        url: '/moderation/products',
        icon: '',
        label: 'Товары',
        permissions: [
          Permissions.SUPER_ADMIN,
          Permissions.MODERATE_PRODUCTS_VIEW,
        ]
      },
      {
        url: '/moderation/products-xml',
        icon: '',
        label: 'Товары из XML',
        permissions: [
          Permissions.SUPER_ADMIN
        ]
      },
      {
        url: '/moderation/products-xls',
        icon: '',
        label: 'Товары из XLS',
        permissions: [
          Permissions.SUPER_ADMIN
        ]
      },
      {
        url: '/moderation/companies',
        icon: '',
        label: 'Компании',
        permissions: [
          Permissions.SUPER_ADMIN,
          Permissions.MODERATE_COMPANIES_VIEW,
        ]
      },
      {
        url: '/moderation/pumping',
        icon: '',
        label: 'Прокачки',
        permissions: [
          Permissions.SUPER_ADMIN,
          Permissions.MODERATE_PUMPING_VIEW,
        ]
      },
      {
        url: '/moderation/ratings',
        icon: '',
        label: 'Рейтинги',
        permissions: [
          Permissions.SUPER_ADMIN,
          Permissions.MODERATE_RATING_VIEW,
        ]
      },
      {
        url: '/moderation/update-order',
        icon: '',
        label: 'Актуализация заказов',
        permissions: [
          Permissions.SUPER_ADMIN,
          Permissions.MODERATE_ORDER,
        ]
      },
      {
        url: '/moderation/activities',
        icon: '',
        label: 'Виды деятельности',
        permissions: [
          Permissions.SUPER_ADMIN,
          Permissions.MODERATE_ACTIVITIES_VIEW,
        ]
      },
    ]
  },
  {
    url: null,
    icon: 'timeline',
    label: 'Статистика и аналитика',
    permissions: [
      Permissions.SUPER_ADMIN,
      Permissions.STATISTICS_AND_ANALYTICS_VIEW,
      Permissions.STATISTICS_AND_SHOWCASES_VIEW,
    ],
    children: [
      {
        url: '/statistics-and-analytics/platform',
        icon: '',
        label: 'Площадка',
        permissions: [
          Permissions.SUPER_ADMIN,
          Permissions.STATISTICS_AND_ANALYTICS_VIEW,
        ]
      },
      {
        url: '/statistics-and-analytics/showcase',
        icon: '',
        label: 'Витрины',
        permissions: [
          Permissions.SUPER_ADMIN,
          Permissions.STATISTICS_AND_SHOWCASES_VIEW,
        ]
      },
    ]
  },


  {
    url: null,
    icon: 'question_answer',
    label: 'Чаты',
    permissions: [
      Permissions.SUPER_ADMIN,
      Permissions.CHAT_MANAGER_VIEW,
      Permissions.CHAT_CONSULTANT_VIEW,
    ],
    children: [
      {
        url: '/chats/manager',
        icon: '',
        label: 'Руководитель',
        permissions: [
          Permissions.SUPER_ADMIN,
          Permissions.CHAT_MANAGER_VIEW,
        ]
      },
      {
        url: '/chats/consultant',
        icon: '',
        label: 'Консультант',
        permissions: [
          Permissions.SUPER_ADMIN,
          Permissions.CHAT_CONSULTANT_VIEW,
        ]
      },
    ]
  },
  {
    url: null,
    icon: 'supervisor_account',
    label: 'Пользователи',
    permissions: [
      Permissions.SUPER_ADMIN,
      Permissions.USERS_VIEW,
      Permissions.EMPLOYEES_VIEW,
      Permissions.ROLES_VIEW,
    ],
    children: [
      {
        url: '/users/platform',
        icon: '',
        label: 'Юр. лица',
        permissions: [
          Permissions.SUPER_ADMIN,
          Permissions.USERS_VIEW,
        ]
      },
      {
        url: '/users/phys-person',
        icon: '',
        label: 'Физ. лица',
        permissions: [
          Permissions.SUPER_ADMIN,
          Permissions.USERS_VIEW,
        ]
      },
      {
        url: '/users/employees',
        icon: '',
        label: 'Сотрудники B2B.CASH',
        permissions: [
          Permissions.SUPER_ADMIN,
          Permissions.EMPLOYEES_VIEW,
        ]
      },
      {
        url: '/users/roles',
        icon: '',
        label: 'Права сотрудников',
        permissions: [
          Permissions.SUPER_ADMIN,
          Permissions.ROLES_VIEW,
        ]
      },
    ]
  },
  {
    url: '/mailer',
    icon: 'send',
    label: 'Рассыльщик',
    permissions: [
      Permissions.SUPER_ADMIN,
      Permissions.MAILER_VIEW,
    ]
  },
  {
    url: '/billing',
    icon: 'monetization_on',
    label: 'Тарификация',
    permissions: [
      Permissions.SUPER_ADMIN,
      Permissions.BILLING_VIEW,
    ]
  },
  {
    url: null,
    icon: 'file_copy',
    label: 'Документы',
    permissions: [
      Permissions.SUPER_ADMIN
    ],
    children: [
      {
        url: '/documents/requisites-settings',
        icon: '',
        label: 'Настройка реквизитов',
        permissions: [
          Permissions.SUPER_ADMIN
        ]
      },
      {
        url: '/documents/list',
        icon: '',
        label: 'Список документов',
        permissions: [
          Permissions.SUPER_ADMIN
        ]
      },
      {
        url: '/documents/generation',
        icon: '',
        label: 'Генерация документов',
        permissions: [
          Permissions.SUPER_ADMIN
        ]
      },
      {
        url: '/documents/export-import',
        icon: '',
        label: 'Экспорт и импорт документов',
        permissions: [
          Permissions.SUPER_ADMIN
        ]
      },
    ]
  },
  {
    url: null,
    icon: 'file_copy',
    label: 'Маркетплейсы',
    permissions: [
      Permissions.SUPER_ADMIN
    ],
    children: [
      {
        url: '/marketplace/list-marketplace',
        icon: '',
        label: 'Управление маркетплейсами',
        permissions: [
          Permissions.SUPER_ADMIN
        ]
      },
      {
        url: '/marketplace/create-marketplace',
        icon: '',
        label: 'Создать маркетплейс',
        permissions: [
          Permissions.SUPER_ADMIN,
          Permissions.EMPLOYEES_VIEW
        ]
      }
    ]
  }
];

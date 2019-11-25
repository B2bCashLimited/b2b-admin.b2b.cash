export const FEED_PROCESS_TYPES = {
  GENERATE_PREVIEW: 24,  // Генерация превью для фидов
  FIELDS_STAT: 25,       // Статистика фида по полям
  VALUES_STAT: 26,       // Статистика фида по значениям
  PARSE_UNKNOWN: 27,     // Парсинг неизвестного фида
  EXPORT_PRODUCTS: 28,   // Экспорт напаршенных продукт
  PARSE_RAW_PRODUCTS: 29,   // Парсинг сырых продуктов на основе схемы
  VALUES_STAT_XLS: 39,   // Статистика XLS фида по значениям
  PARSE_RAW_PRODUCTS_XLS: 40,   // Парсинг сырых продуктов на основе схемы XLS
  EXPORT_PRODUCTS_XLS: 41   // Экспорт напаршенных продукт XLS
};

export const FEED_PRODUCT_STATUSES = {
  REQUIRED_FIELDS_MISSED: 0,  // Не найдены обязательные поля
  CATEGORY_NOT_RECOGNIZED: 1, // Категория найдена, но не распознана
  CATEGORY_AMBIGUOUS: 2,      // Найдено более одной подходящий категории
  PROPERTIES_INCOMPATIBLE: 3, // Характеристики не соответствуют категории
  CATEGORY_QUALITY_LOW: 4,    // Категория найдена неточным соответствием
  CATEGORY_QUALITY_HIGH: 5,   // Категория найдена точным соответствием
  PERFECT: 6,                 // Все поля распарсились корректно
};

export const TASK_STATUSES = {
  NEW: 1, // Статус новый
  IN_PROGRESS: 2, // Статус в процессе
  COMPLETED: 4, // Статус обработанный
  FAILED: 5, // Статус отклонен
};

export const enum ActivityNames {
  Supplier = 1,                             // Поставщик
  ProducerFactory = 2,                      // Завод-изготовитель
  CustomsRepresentativeWithoutLicense = 3,  // Таможенный представитель без лицензии
  CustomsRepresentativeWithLicense = 4,     // Таможенный представитель с лицензией
  InternationalRoadHauler = 5,              // Международный автоперевозчик
  DomesticRoadHauler = 6,                   // Автоперевозки внутри страны
  InternationalRailCarriers = 7,            // Международные Ж/Д перевозки
  DomesticRailCarriers = 8,                 // Ж/Д перевозки внутри страны
  InternationalAirCarriers = 9,             // Международные авиаперевозки
  DomesticAirCarriers = 10,                 // Авиаперевозки внутри страны
  SeaLines = 11,                            // Морские линии
  RiverLines = 12,                          // Речные линии внутри страны
  RentingWarehouse = 13,                    // Сдача склада в аренду
  ConsignmentWarehouse = 14,                // Склад ответственного хранения
  Buyer = 15,                               // Покупатель
}

export const ActivityNameGroups = {
  products: [
    ActivityNames.Supplier,
    ActivityNames.ProducerFactory
  ],
  routes: [
    ActivityNames.InternationalRoadHauler,
    ActivityNames.DomesticRoadHauler,
    ActivityNames.InternationalRailCarriers,
    ActivityNames.DomesticRailCarriers,
    ActivityNames.InternationalAirCarriers,
    ActivityNames.DomesticAirCarriers,
    ActivityNames.SeaLines,
    ActivityNames.RiverLines,
  ],
  customsRoutes: [
    ActivityNames.CustomsRepresentativeWithoutLicense,
    ActivityNames.CustomsRepresentativeWithLicense,
  ]
};

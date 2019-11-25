export interface ChatGetParams {
  userId: number;        // (required, number) ... идентификатор пользователя
  type: number;          // (required, number) ... тип, 1- системные, 2 - партнерские, 3- плошадка
  search?: string;       // (optional, text) ... текст поиска
  myCompany?: number;    // (optional, number) ... идентификатор компании пользователя
  myActivity?: number;   // (optional, number) ... идентификатор вида деятельности пользователя
  myActivityId?: number; // (optional, number) ... конкретный id вида деятельности
  owner?: number;        // (optional, number) ... идентификатор "мои заказы" или "заказы клиентов"
  activity?: string;     // (optional, text) ... вид деятельности для фильтрации
  page?: number;         // (optional, page, 1) ... страница
  limit?: number;        // (optional, number, 1) ... количество записей
}

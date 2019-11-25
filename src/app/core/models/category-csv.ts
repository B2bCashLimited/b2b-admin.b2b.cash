export interface CategoryCsv {
  categoryId: number;
  google: Files;
  k50: Files;
}

interface Files {
  simple: string;
  all: string;
}

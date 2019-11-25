export interface Currency {
  descCn: string;
  descEn: string;
  descRu: string;
  id: number;
  nameCn: string;
  nameEn: string;
  nameRu: string;
  _embedded: {
    controlUnitType: ControlUnitType;
  };
  _links: any;
}

interface ControlUnitType {
  descCn: string;
  descEn: string;
  descRu: string;
  id: string;
  nameCn: string;
  nameEn: string;
  nameRu: string;
  _links: any;
}

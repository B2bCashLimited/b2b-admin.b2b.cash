import { ControlUnitType } from '@b2b/models';

export interface Unit {
  id: number;
  nameRu: string;
  nameEn: string;
  nameCn: string;
  controlUnitType: ControlUnitType;
}

import { Photo } from './photo.model';
import {CountrySummary} from './country-summary';

export interface ProductFullSearch extends InternationalNames {
    id: string;
    net: string;
    gross: string;
    volume: string;
    minimal_amount: number;
    companyName: string;
    country: string;
    countryData: CountrySummary;
    productManufacturerId: number;
    productManufacturerData: ManufactureModel;
    moderateStatus: number;
    moderateComment: string;
    moderateCommentEditing: boolean;
    manufactureName: string;
    manufactureFullName: string;
    manufactureId: string;
    manufactureModerateStatus: number;
    manufactureCountEmployees: number;
    supplierName: string;
    supplierFullName: string;
    supplierId: string;
    supplierModerateStatus: number;
    supplierCountEmployees: number;
    photos: Photo[];
    showcase: any;
    showcaseId: string;
    showcaseUnits: ShowcaseUnitModel[];
    productProperties: ProductProperty[];
    activity: Activity;
}

interface ManufactureModel extends InternationalNames {
    id: string;
}

interface ShowcaseUnitModel extends InternationalNames {
    id: string;
    sopId: string;
    product: string;
}

export interface ProductProperty {
    id: number;
    valueRu: string;
    valueEn: string;
    valueCn: string;
    product: string;
    categoryPropertyId: number;
    categoryPropertyNameRu: string;
    categoryPropertyNameEn: string;
    categoryPropertyNameCn: string;
    special: number;
}

export interface Activity {
    id: string;
    type: 'supplier' | 'manufactory';
    name: string;
    fullName: string;
    moderateStatus: number;
    countEmployees: number;
    isModerateModeChanging: boolean;
}

interface InternationalNames {
    nameRu: string;
    nameEn: string;
    nameCn: string;
}


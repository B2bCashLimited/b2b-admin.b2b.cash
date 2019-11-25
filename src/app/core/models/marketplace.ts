export interface Marketplace {
    description: string;
    fullname: string;
    id: string;
    logo: any[];
    name: string;
    siteUrls: string[];
    users: Self;
    structure: any;

}

export interface Self {
    href: string;
}

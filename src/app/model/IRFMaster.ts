
import { Client } from './client';
import { BusinessPartner } from './BusinessPartner';
import { CityBusinessPartner } from './CityBusinessPartner';
import { Branch } from './Branch';
import { DropDown } from './DropDown';
import { GenericCode } from './GenericCode';

export class IRFMaster {
  IRFType: Array<string>;
  IRFSubType: Array<string>;
  InvoiceType: Array<string>;
  CurrencyDetails: Array<string>;
  ClientType: Array<string>;
  Clients: Array<DropDown>;
  EntityType: Array<string>;
  SharingType: Array<string>;
  BusinessPartners: Array<BusinessPartner>;
  CityBusinessPartners: Array<CityBusinessPartner>;
  Branches: Array<Branch>;
  GeneriCodes: Array<GenericCode>;
}

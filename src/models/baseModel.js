const strummer = require('strummer');
const GeoLocation = require('./geoLocation');
const Types = require('../repository/geoTransactionRepository').TYPE_MAP;

const BaseModelMatcherFields = Object.freeze({
  accountId: new strummer.integer({ parse: true, min:1, max:Number.MAX_SAFE_INTEGER}),
  type: new strummer.enum({values:Object.keys(Types)}),
  geoLocation: GeoLocation.matcher,
  dateTime: new strummer.isoDate({ optional: true }),
  brand: new strummer.string({ optional: true }),
});

const BaseModelMatcher = new strummer.object(BaseModelMatcherFields);

// TODO: create a DateTime class extended from Date
const DateTime = {
  transfer: dt => dt.getTime(),
};

// TODO: create a Brand class to handle default brand and error handing in transfer function
// {"name":"brand","type":"int","doc":"identified brand. 1=UBET, 2=TAB"},
const Brand = {
  BRAND_MAP: Object.freeze({ 'UBET': 1, 'TAB': 2 }),
  transfer: brand => Brand.BRAND_MAP[brand] ? Brand.BRAND_MAP[brand] : -1,
};

const BaseModelFields = Object.freeze(Object.keys(BaseModelMatcherFields));

class BaseModel {
  constructor(obj) {
    const unmatchedList = BaseModelMatcher.match(obj);
    if (unmatchedList.length > 0) {
      throw new Error('Cannot parse BaseModel');
    }
    Object.assign(this, {
      accountId: Number.parseInt(obj.accountId, 10),
      type: String(obj.type),
      geoLocation: obj.geoLocation instanceof GeoLocation ? obj.geoLocation : new GeoLocation(obj.geoLocation),
      // TODO: Replace me when DateTime class is created
      dateTime: obj.dateTime ? obj.dateTime instanceof Date ? obj.dateTime : new Date(obj.dateTime) : new Date(),
      // TODO: Replace me when Brand class is created
      brand: obj.brand ? String(obj.brand) : 'TAB',
    });
  }

  static transfer(baseModel) {
    if (!(baseModel instanceof BaseModel)) {
      throw new Error(`Cannot transfer type ${typeof baseModel} in BaseModel`);
    }
    const transferredGeoLocation = GeoLocation.transfer(baseModel.geoLocation);
    const tranDateTime = DateTime.transfer(baseModel.dateTime);
    const brand = Brand.transfer(baseModel.brand);
    return Object.assign({}, {
      ...transferredGeoLocation,
      accountNum: baseModel.accountId,
      tranDateTime,
      brand,
    });
  }
}

BaseModel.fields = BaseModelFields;
BaseModel.matcher = BaseModelMatcher;
BaseModel.matcherFields = BaseModelMatcherFields;

module.exports = BaseModel;

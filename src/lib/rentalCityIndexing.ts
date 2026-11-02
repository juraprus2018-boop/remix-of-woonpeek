export const MIN_RENTAL_CITY_LISTINGS = 6;

export const isRentalCityIndexable = (count: number) => count >= MIN_RENTAL_CITY_LISTINGS;
export const shouldNoindexRentalCity = (ready: boolean, count: number | undefined) =>
  ready && count !== undefined && !isRentalCityIndexable(count);
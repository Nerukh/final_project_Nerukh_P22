import * as Location from 'expo-location';

export const getCityName = async (latitude: number, longitude: number): Promise<string | null> => {
  try {
    const addressArray = await Location.reverseGeocodeAsync({
      latitude,
      longitude,
    });

    if (addressArray.length > 0) {
      const item = addressArray[0];
      return item.city || item.subregion || item.region || item.country || null;
    }

    return null;
  } catch (error) {
    console.warn("Error in getCityName:", error);
    return null;
  }
};
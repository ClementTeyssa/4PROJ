import {PermissionsAndroid} from 'react-native';

/**
 * Demande la localisation via une Alert
 *
 * @export
 * @returns
 */
export async function requestLocationPermission() {
    try {
      // Demande l'autorisation d'utiliser la localisation
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION, {
          title: 'Permission de localisation pour le bluetooth',
          message: 'Pour utiliser le mode courses, veuillez autoriser la localisation.',
          buttonNegative: 'Non',
          buttonPositive: 'Oui',
        },
      ); 
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('Location permission for bluetooth scanning granted');
        return true;
      } else {
        console.log('Location permission for bluetooth scanning revoked');
        return false;
      }
    } catch (err) {
      console.warn(err);
      return false;
    }
  }
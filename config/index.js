import DeviceInfo from 'react-native-device-info';

const DEBUG = false;

export const deviceId = (`${DeviceInfo.getAndroidId()}`).replace(/[^\w\s]/gi, '');
export const SERVER_LINK = `${DEBUG ? 'http://115.77.159.59' : 'https://server.nghi.lavenes.com'}`
export const API = `${SERVER_LINK}/lavenes_api/v1`;
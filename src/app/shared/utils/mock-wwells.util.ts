import { WWell } from 'src/app/shared/models/config/agwa-map.config';

export function getMockKsaWwells(): WWell[] {
  return [
    { wwellId: 'GW-RYD-01', lat: 24.7136, lng: 46.6753, location: 'SAQA', label: '3300' },
    { wwellId: 'GW-JED-02', lat: 21.4858, lng: 39.1925, location: 'UMER', label: '58'   },
    { wwellId: 'GW-TAB-03', lat: 28.3835, lng: 36.5662, location: 'WASI', label: '1514' },
    { wwellId: 'GW-DAM-04', lat: 26.4207, lng: 50.0888, location: 'ARUM', label: '60'   },
    { wwellId: 'GW-ABH-05', lat: 18.2164, lng: 42.5053, location: 'ALAT', label: '3300' },
  ];
}

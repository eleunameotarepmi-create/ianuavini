
import { getWineryRegion, REGIONS_MAP, PIEMONTE_MAP } from './constants';

const vdaLocations = [
    'Donnas', 'Arnad', 'Chambave', 'Nus', 'Aosta', 'Saint-Pierre', 'Morgex', 'La Salle'
];

const piemonteLocations = [
    'Barolo', 'Barbaresco', 'Canale', 'Gattinara', 'Caluso'
];

// Mock Winery
const makeWinery = (loc: string, reg?: string) => ({
    id: 'test', name: 'Test', location: loc, region: reg || '',
    description: '', image: '', website: '', coordinates: { lat: 0, lng: 0 }
});

console.log("--- TESTING VDA LOCATIONS ---");
vdaLocations.forEach(loc => {
    const region = getWineryRegion(makeWinery(loc));
    console.log(`${loc} -> ${region}`);
});

console.log("\n--- TESTING PIEMONTE LOCATIONS ---");
piemonteLocations.forEach(loc => {
    const region = getWineryRegion(makeWinery(loc));
    console.log(`${loc} -> ${region}`);
});

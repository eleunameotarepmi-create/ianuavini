
import * as fs from 'fs';

const data = JSON.parse(fs.readFileSync('live_data_backup.json', 'utf-8'));
const wineries = data.wineries || [];





console.log("Wineries found:", wineries.length);
const matches = wineries.filter((w: any) => w.id.includes('1768274751270') || w.name.toLowerCase().includes('bonin'));
matches.forEach((w: any) => console.log(`[${w.id}] ${w.name}`));





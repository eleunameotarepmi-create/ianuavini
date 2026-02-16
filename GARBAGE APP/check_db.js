import fs from 'fs';
const files = ['db.json', 'RESTORE_FINAL.json', 'live_db.json', 'CLEAN_RESTORE.json', 'live_data_backup.json'];
files.forEach(f => {
    if (fs.existsSync(f)) {
        try {
            const data = fs.readFileSync(f, 'utf8');
            const db = JSON.parse(data);
            console.log(`${f.padEnd(25)} | Wineries: ${(db.wineries ? db.wineries.length : 0).toString().padStart(4)} | Wines: ${(db.wines ? db.wines.length : 0).toString().padStart(5)} | Menu: ${(db.menu ? db.menu.length : 0).toString().padStart(4)}`);
        } catch (e) {
            console.log(`${f.padEnd(25)} | ERROR parsing file`);
        }
    } else {
        console.log(`${f.padEnd(25)} | File not found`);
    }
});

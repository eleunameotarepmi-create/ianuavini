import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Server } from 'socket.io';
import { createServer } from 'http';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

const PORT = process.env.PORT || 3577;
const DB_FILE = path.join(__dirname, 'db.json');
const ADMIN_TOKEN = 'ianua2024'; // Simple security token

app.use(cors());
app.use(express.json({ limit: '5000mb' }));
app.use(express.urlencoded({ extended: true, limit: '5000mb' }));

// Increase server timeout for large files (10 minutes)
httpServer.setTimeout(600000); // Also increase URL encoded limit

// Middleware to handle JSON parsing errors (properties too large, invalid JSON)
app.use((err, req, res, next) => {
    if (err) {
        console.error("Middleware Error:", err.message);
        return res.status(400).json({ error: `Server Middleware Error: ${err.message}` });
    }
    next();
});

// Ensure DB file exists
if (!fs.existsSync(DB_FILE)) {
    const initialData = { wines: [], wineries: [], menu: [], glossary: [], ai_instructions: [] };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2));
}

// GET DB
app.get('/api/db', (req, res) => {
    try {
        const data = fs.readFileSync(DB_FILE, 'utf8');
        res.json(JSON.parse(data));
    } catch (err) {
        res.status(500).json({ error: 'Failed to read database' });
    }
});

// POST DB (Save)
app.post('/api/db', (req, res) => {
    try {
        const { data, token } = req.body;

        // Security check
        if (token !== ADMIN_TOKEN) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        if (!data || !data.wines || !data.wineries) {
            return res.status(400).json({ error: 'Invalid data structure' });
        }

        fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));

        // Notify all clients that DB has changed
        io.emit('db_updated', data);

        res.json({ success: true, message: 'Saved successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to save database' });
    }
});

// EXPORT BACKUP
app.get('/api/admin/backup/export', (req, res) => {
    try {
        if (fs.existsSync(DB_FILE)) {
            const data = fs.readFileSync(DB_FILE, 'utf8');
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const filename = `db-backup-${timestamp}.json`;

            res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
            res.setHeader('Content-Type', 'application/json');
            res.send(data);
        } else {
            res.status(404).json({ error: 'Database file not found' });
        }
    } catch (err) {
        console.error("Export error:", err);
        res.status(500).json({ error: 'Failed to export backup' });
    }
});

// IMPORT BACKUP
app.post('/api/admin/backup/import', (req, res) => {
    try {
        const { data, token } = req.body;

        // Security check
        if (token !== ADMIN_TOKEN) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        // Validate 
        if (!data || typeof data !== 'object') {
            return res.status(400).json({ error: 'Invalid JSON data' });
        }

        const requiredKeys = ['wines', 'wineries', 'menu']; // glossary and ai_instructions might be optional or added later
        const missingKeys = requiredKeys.filter(key => !data.hasOwnProperty(key));

        if (missingKeys.length > 0) {
            console.error("DEBUG: Import failed. Received keys:", Object.keys(data));
            return res.status(400).json({ error: `Invalid backup structure. Missing keys: ${missingKeys.join(', ')}. Found: ${Object.keys(data).join(', ')}` });
        }

        // Strict Validation for Wines (Sample check)
        if (Array.isArray(data.wines) && data.wines.length > 0) {
            const sampleWine = data.wines[0];
            if (!sampleWine.hasOwnProperty('id') || !sampleWine.hasOwnProperty('name')) {
                return res.status(400).json({ error: 'Invalid wine structure in backup.' });
            }
        }

        // Create a safety backup of current DB before overwriting
        if (fs.existsSync(DB_FILE)) {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const safetyBackupPath = path.join(__dirname, `db.safety-backup-${timestamp}.json`);
            fs.copyFileSync(DB_FILE, safetyBackupPath);
            console.log(`Safety backup created at ${safetyBackupPath}`);
        }

        // Overwrite DB
        fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));

        // Notify clients
        io.emit('db_updated', data);

        res.json({ success: true, message: 'Backup imported successfully. Database updated.' });

    } catch (err) {
        console.error("Import error:", err);
        res.status(500).json({ error: 'Failed to import backup' });
    }
});

// Socket integration
io.on('connection', (socket) => {
    console.log('📱 Client connected to real-time sync');

    // Manda subito i dati al client appena connesso (Robustezza per mobile)
    try {
        if (fs.existsSync(DB_FILE)) {
            const data = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
            socket.emit('db_updated', data);
        }
    } catch (e) {
        console.error("Error sending initial data to socket:", e);
    }
});

httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`🍷 Ianua Wines Server running on http://0.0.0.0:${PORT}`);
    console.log(`📁 Database file: ${DB_FILE}`);
    console.log(`⚡ Real-time updates active via WebSockets`);
});

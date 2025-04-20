const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// Configuración de la conexión a la base de datos usando variables de entorno
const dbConfig = {
    host: process.env.DB_HOST || 'localhost', // El nombre del contenedor MySQL
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'my_secret_password', // ¡Cambia esto!
    database: process.env.DB_NAME || 'fintech',
    waitForConnections: true, // Esperar si no hay conexiones disponibles
    connectionLimit: 10,      // Máximo de conexiones en el pool
    queueLimit: 0             // Cola ilimitada para conexiones
};

// Crear el pool de conexiones.
// El pool gestionará la creación de conexiones bajo demanda.
let pool;

async function initializePool() {
    try {
         console.log('Attempting to create database pool with config:', {
             host: dbConfig.host,
             database: dbConfig.database,
             user: dbConfig.user,
         });
        pool = mysql.createPool(dbConfig);
        console.log('Database pool created successfully!');

        // Opcional: Probar una conexión del pool para verificar credenciales/acceso inicial
        try {
            const connection = await pool.getConnection();
            const [rows] = await connection.execute('SELECT 1 + 1 AS solution');
            console.log('Database pool test query successful. Solution:', rows[0].solution);
            connection.release(); // Devuelve la conexión al pool
        } catch (testErr) {
             console.error('Database pool test query failed:', testErr.stack);
        }


    } catch (err) {
        console.error('Failed to create database pool:', err.stack);
    }
}

// Inicializar el pool al arrancar la aplicación
initializePool();


// Middleware para verificar si el pool está disponible antes de las rutas API
app.use('/api', (req, res, next) => {
    if (!pool) {
        console.error('Database pool not initialized.');
        return res.status(503).send('Service Unavailable: Database pool not initialized.');
    }
    next();
});


// --- Endpoints API para CRUD ---

// READ all accounts
app.get('/api/accounts', async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM accounts');
        res.json(rows);
        console.log('GET /api/accounts - Success');
    } catch (err) {
        console.error('Error fetching accounts:', err.stack);
        res.status(500).send('Error fetching accounts');
    }
});

// READ account by ID
app.get('/api/accounts/:id', async (req, res) => {
    const accountId = req.params.id;
    try {
        const [rows] = await pool.execute('SELECT * FROM accounts WHERE id = ?', [accountId]);
        if (rows.length > 0) {
            res.json(rows[0]);
            console.log(`GET /api/accounts/${accountId} - Success`);
        } else {
            res.status(404).send('Account not found');
            console.log(`GET /api/accounts/${accountId} - Not Found`);
        }
    } catch (err) {
        console.error(`Error fetching account ${accountId}:`, err.stack);
        res.status(500).send('Error fetching account');
    }
});

// CREATE new account
app.post('/api/accounts', async (req, res) => {
    const { name, balance } = req.body;

    if (!name || balance === undefined || isNaN(parseFloat(balance))) {
        console.log('POST /api/accounts - Bad Request (Invalid input)', req.body);
        return res.status(400).send('Invalid input: name and valid balance are required.');
    }

    const balanceDecimal = parseFloat(balance);

    try {
        const [result] = await pool.execute(
            'INSERT INTO accounts (name, balance) VALUES (?, ?)',
            [name, balanceDecimal]
        );
        res.status(201).json({ id: result.insertId, name, balance: balanceDecimal });
        console.log('POST /api/accounts - Success (ID:', result.insertId, ')');
    } catch (err) {
        console.error('Error creating account:', err.stack);
        res.status(500).send('Error creating account');
    }
});

// UPDATE existing account
app.put('/api/accounts/:id', async (req, res) => {
    const accountId = req.params.id;
    const { name, balance } = req.body;

     if (!name || balance === undefined || isNaN(parseFloat(balance))) {
         console.log(`PUT /api/accounts/${accountId} - Bad Request (Invalid input)`, req.body);
        return res.status(400).send('Invalid input: name and valid balance are required.');
    }

    const balanceDecimal = parseFloat(balance);

    try {
        const [result] = await pool.execute(
            'UPDATE accounts SET name = ?, balance = ? WHERE id = ?',
            [name, balanceDecimal, accountId]
        );

        if (result.affectedRows > 0) {
            res.status(200).json({ id: accountId, name, balance: balanceDecimal });
             console.log(`PUT /api/accounts/${accountId} - Success`);
        } else {
            res.status(404).send('Account not found');
             console.log(`PUT /api/accounts/${accountId} - Not Found`);
        }
    } catch (err) {
        console.error(`Error updating account ${accountId}:`, err.stack);
        res.status(500).send('Error updating account');
    }
});

// DELETE account
app.delete('/api/accounts/:id', async (req, res) => {
    const accountId = req.params.id;

    try {
        const [result] = await pool.execute(
            'DELETE FROM accounts WHERE id = ?',
            [accountId]
        );

        if (result.affectedRows > 0) {
            res.status(200).send(`Account with ID ${accountId} deleted successfully`);
             console.log(`DELETE /api/accounts/${accountId} - Success`);
        } else {
            res.status(404).send('Account not found');
             console.log(`DELETE /api/accounts/${accountId} - Not Found`);
        }
    } catch (err) {
        console.error(`Error deleting account ${accountId}:`, err.stack);
        res.status(500).send('Error deleting account');
    }
});

// Endpoint raíz (sin cambios)
app.get('/', (req, res) => {
    res.send('FinTech Backend with CRUD (Pool) is running!');
});

app.listen(port, () => {
    console.log(`FinTech Backend listening at http://localhost:${port}`);
});

// Manejar señales de terminación para cerrar el pool de conexiones
process.on('SIGINT', async () => {
    console.log('Closing database pool...');
    if (pool) {
        await pool.end(); // Cierra todas las conexiones en el pool
    }
    console.log('Backend shutting down.');
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('Received SIGTERM. Closing database pool...');
     if (pool) {
        await pool.end();
    }
    console.log('Backend shutting down.');
    process.exit(0);
});
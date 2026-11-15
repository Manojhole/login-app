const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 3003;
app.use(express.static(path.join(__dirname, 'public')));
app.get('/health', (_req, res) => res.status(200).json({ status: 'ok', app: 'contact' }));
app.listen(port, '0.0.0.0', () => console.log('Vegz contact listening on ' + port));

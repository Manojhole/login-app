const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 3004;
app.use(express.static(path.join(__dirname, 'public')));
app.get('/health', (_req, res) => res.status(200).json({ status: 'ok', app: 'profile' }));
app.listen(port, '0.0.0.0', () => console.log('Vegz profile listening on ' + port));

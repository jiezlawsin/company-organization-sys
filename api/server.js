const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const companyRoutes = require('./routes/companies');
const employeeRoutes = require('./routes/employees');

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use('/api/companies', companyRoutes);
app.use('/api/employees', employeeRoutes);

const PORT = 3000;
app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
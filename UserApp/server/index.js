const express = require('express');
const app = express();
const port = process.env.PORT || 4321;

app.use(express.static('public'));

// GET balance from Billing contract

// POST funds to billing account

app.listen(port, () => {
  console.log(`User app listening on port ${port}`);
});

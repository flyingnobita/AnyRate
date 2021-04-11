const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());

const usageData = {
  // Index is time, value is total usage
  'a': [1, 2, 4, 5, 7, 8, 10, 12, 13, 17],
  'b': [0, 2, 2, 4, 5, 5, 6, 7, 8, 8, 10],
  'c': [0, 5, 7, 10, 14, 19, 25, 31, 37, 39]
};

app.get('/usage', (req, res) => {
  try {
    const { account, since } = req.query;
    console.log(`Getting usage for ${account} since ${since}`);
    // Modulo to stay within the sample data
    const accountUsage = usageData[account];
    let usageAtSince = accountUsage[since % accountUsage.length];
    let usageNow = accountUsage[accountUsage.length - 1];
    res.send({ count: usageNow - usageAtSince });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error!");
  }
});

app.listen(process.env.PORT || 4000, () => {
  console.log(`Business API listening on port ${process.env.PORT}`);
});

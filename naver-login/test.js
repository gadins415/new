const express = require('express');
const app = express();
const port = 3000;

app.get('/', (req, res) => {
  console.log('Root endpoint hit');
  res.send('Hello, World!~~~~~~');
});

app.listen(port, () => {
  console.log(`Server listening at http://kanggadintaxi.shop:${port}`);
});

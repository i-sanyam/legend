const Express = require("express");
const cookieParser = require('cookie-parser')
const app = Express();
const cors = require('cors');

app.use(Express.json());
app.use(Express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors());

app.use('/api', require('./routes'));

app.get('/', (req, res) => {
  return res.send('Welcome to Heimdall - Open Source Access Management.');
});

MONGODB_CONNECTOR = null;
(async () => {
  const { MONGO_CONNECTOR: db } = await require('./startup')();
  MONGODB_CONNECTOR = db;
  await db.listCollections();
  app.listen(3000, () => {
    console.log(`Server started on localhost:3000`);
  });
})();
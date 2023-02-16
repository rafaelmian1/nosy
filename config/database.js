const mongoose = require('mongoose');

mongoose
  .connect(process.env.MONGODB)
  .then(() => console.log('Database connected'))
  .catch((err) => console.log('Database error \n' + err));

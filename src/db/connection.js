const mongoose = require('mongoose');
const dbURL = process.env.MONGODB_URL;

const options = {    
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
    autoIndex: true, // build indexes
  };

mongoose.connect(dbURL, options)
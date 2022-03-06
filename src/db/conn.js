const mongoose = require('mongoose');

mongoose.connect("mongodb://localhost:27017/YoutubeAssignment", {
    // useNemUrlParser : true,
    useUnifiedTopology : true,
    // useCreateIndex : true
}).then(()=>{
    console.log('connection successful.');
}).catch((err)=>{
    console.error(err);
});
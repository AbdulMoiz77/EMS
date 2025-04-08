const express = require('express');
const app = express();
const port = 5000;
const LogsModel = require("./Models/logsmodel.js");
 

app.use(express.json());


app.get('',(req,resp)=>{
    resp.send('hello this is home page');
});

app.post('/data', async (req,resp)=>{
  console.log('Received POST request');
  console.log(req.body);
  const result = await LogsModel.putReadings(req.body["timestamp"], req.body["temperature"], req.body["humidity"]);
  console.log(result);
  resp.json({status: 'OK', received:req.body});

})

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});


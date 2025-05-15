const express = require('express');
const path = require('path');
const app = express();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' }); 
const port = 5000;
const uploadToDrive = require("./Upload/uploadFile.js");

require('dotenv').config();

const userID = process.env.ADMIN_USER;
const pass = process.env.ADMIN_PASS;

const cors = require('cors');
app.use(cors({
  origin: 'https://painted-bg-selling-puts.trycloudflare.com ',
}));

app.use(express.json());

app.get('',(req,resp)=>{
    resp.send('hello this is home page');
});

app.post('/api/login' , async (req,resp)=>{
  const receivedData = req.body
  const result = (userID == receivedData.id) && (pass == receivedData.pass)
  const data = {'message':'Success', result: result}
  resp.json(data)
})

app.post('/api/uploadToDrive', upload.single('file'), async (req, resp) => {
  try {
    const result = await uploadToDrive(req.file);
    resp.json({ success: true, fileId: result.id });
  } catch (error) {
    console.error('Upload error:', error);
    resp.status(500).json({ success: false, error: error.message });
  }
});


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});


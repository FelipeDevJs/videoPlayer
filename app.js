const express = require('express');
const fs = require('fs');

const PORT = process.env.PORT || 3000;

const app = express();

const videoFileMap={
  'cdn':'videos/cdn.mp4'
}

app.get('/', (req, res)=> {
  res.send('Olá, bem vinda a minha API!')
})

app.get('/videos/:filenacdme', (req, res)=>{
  const fileName  = req.params.filename;
  const filePath = videoFileMap[fileName]
  if(!filePath){
    return res.status(404).send('File not found')
  }
  const stat = fs.statSync(filePath);
  const fileSize = stat.size;
  const range = req.headers.range;

  if(range){
    const parts = range.replace(/bytes=/, '').split('-')
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

    const chunksize = end - start + 1;
    const file = fs.createReadStream(filePath, {start, end});
    const head =  {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Rages': 'bytes',
      'Content-Lenght': chunksize,
      'Content-Type': 'video/mp4'
    };
    res.writeHead(206, head);
    file.pipe(res);
  }else {
    const head =  {
      'Content-Lenght': fileSize,
      'Content-Type': 'video/mp4'
    };
    res.writeHead(200,head)
    fs.createReadStream(filePath).pipe(res)
  }
})

app.listen(PORT, ()=>{
  console.log(`server is listenig ${PORT}` )
})
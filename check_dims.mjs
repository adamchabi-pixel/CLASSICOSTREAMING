import https from 'https';

const getDims = (url) => {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      res.on('data', (chunk) => {
        resolve(chunk.length);
        res.destroy();
      });
    });
  });
};

console.log(await getDims('https://image.tmdb.org/t/p/original/97yvRBw1GzX7fXprcF80er19ot.jpg'));

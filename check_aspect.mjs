import https from 'https';

function checkImage(url) {
  https.get(url, (res) => {
    let data = [];
    res.on('data', (chunk) => data.push(chunk));
    res.on('end', () => {
      console.log(url, 'Size:', Buffer.concat(data).length);
    });
  });
}

checkImage('https://image.tmdb.org/t/p/original/pvske1MyAoymrs5bguRfVqYiM9a.jpg');
checkImage('https://image.tmdb.org/t/p/original/bxBlRPEPpMVDc4jMhSrTf2339DW.jpg');
checkImage('https://image.tmdb.org/t/p/original/97yvRBw1GzX7fXprcF80er19ot.jpg');
checkImage('https://image.tmdb.org/t/p/original/pbpMk2JmcoNnQwx5JGpXngfoWtp.jpg');

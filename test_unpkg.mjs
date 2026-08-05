async function check(url) {
    const res = await fetch(url);
    console.log(url, res.status);
}

check('https://unpkg.com/simple-icons@11.0.0/icons/disneyplus.svg');
check('https://unpkg.com/simple-icons@11.0.0/icons/hulu.svg');
check('https://unpkg.com/simple-icons@11.0.0/icons/primevideo.svg');

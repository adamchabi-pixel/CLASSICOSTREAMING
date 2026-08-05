const fetch = require('node-fetch');

async function check(name) {
    const res = await fetch(`https://cdn.simpleicons.org/${name}/white`);
    console.log(name, res.status);
}

check('disneyplus');
check('hulu');
check('primevideo');
check('prime');
check('amazonprime');
check('hbo');
check('max');

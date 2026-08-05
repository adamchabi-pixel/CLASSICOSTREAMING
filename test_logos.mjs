async function check(url) {
    try {
        const res = await fetch(url);
        console.log(url, res.status);
    } catch (e) {
        console.log(url, "Error");
    }
}
check('https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg');
check('https://upload.wikimedia.org/wikipedia/commons/c/ce/Max_logo.svg');
check('https://upload.wikimedia.org/wikipedia/commons/3/3e/Disney%2B_logo.svg');
check('https://upload.wikimedia.org/wikipedia/commons/e/e4/Hulu_Logo.svg');
check('https://upload.wikimedia.org/wikipedia/commons/1/11/Amazon_Prime_Video_logo.svg');
check('https://upload.wikimedia.org/wikipedia/commons/2/28/Apple_TV_Plus_Logo.svg');
check('https://upload.wikimedia.org/wikipedia/commons/a/a5/Paramount_Plus.svg');

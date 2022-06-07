function waitForElm(selector) {
    return new Promise(resolve => {
        if (document.querySelector(selector)) {
            return resolve(document.querySelector(selector));
        }

        const observer = new MutationObserver(mutations => {
            if (document.querySelector(selector)) {
                resolve(document.querySelector(selector));
                observer.disconnect();
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    });
}

/*
To use it:

waitForElm('.some-class').then((elm) => {
    console.log('Element is ready');
    console.log(elm.textContent);
});
Or with async/await:

const elm = await waitForElm('.some-class');

You might also be able squeeze more performance out of it by doing mutations.addedNodes.find(node => node.matchesSelector("..."))

*/
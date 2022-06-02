console.log("From background");
// console.log(chrome.tabs.query({currentWindow: true})); --> Get all open tabs in current window.

chrome.runtime.onMessage.addListener((req, sender, res) => {
    console.log(req.message);
    res("Message received");
})
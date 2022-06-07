
allOrdersInputBtn.addEventListener("click", async() => {
    let allBtns = document.getElementsByTagName("button");
    for (let btnElement of allBtns) {
        if (btnElement.id !== "allOrdersInputBtn")    btnElement.click();
    }
})

fkOrderInputBtn.addEventListener("click", async() => {
    let [tab] = await chrome.tabs.query({url:"https://seller.flipkart.com/*"});

    chrome.scripting.executeScript({
        target: {tabId: tab.id},
        files: ["jquery-3.6.0.js", "flipkart/fkNavigation.js", "flipkart/fkOrderInput.js"]
    });

})

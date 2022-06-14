
allOrdersInputBtn.addEventListener("click", async() => {
    let allBtns = document.getElementsByTagName("button");
    for (let btnElement of allBtns) {
        if (btnElement.id !== "allOrdersInputBtn")    btnElement.click();
    }
})

let fkClickCount = 0;
fkOrderInputBtn.addEventListener("click", async() => {
    let [tab] = await chrome.tabs.query({url:"https://seller.flipkart.com/*"});

    // chrome.scripting.executeScript({
    //     target: {tabId: tab.id},
    //     func: fkOrderInput
    // });
    chrome.tabs.sendMessage(tab.id, {action: "Check Flipkart Orders"});

})

const delay = (ms) => new Promise((res) => setTimeout(res, ms));
console.log("hello from content script");

chrome.storage.local.get("bijnisNavigation", function (storageData) {
  console.log(storageData);
  if (storageData.bijnisNavigation == true) {
    console.log("calling navigation logic");
    chrome.storage.local.set({ bijnisNavigation: false });
    bijnisNavigation();
  }
});
chrome.runtime.onMessage.addListener(async (msg, sender, msgRes) => {
  console.log({ msg, sender });
  if (msg.action === "Check bijnis Orders") {
    // first navigate to order's tab from dashboard

    let orderButton = $("ul a li:contains('Orders')");
    chrome.storage.local.set({ bijnisNavigation: true });
    orderButton.click();
  }
});

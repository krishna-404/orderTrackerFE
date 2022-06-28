console.log("hello from content script");

chrome.runtime.onMessage.addListener(async (msg, sender, msgRes) => {
  console.log({ msg, sender });
  if (msg.action === "Check bijnis Orders") {
    // first navigate to order's tab from dashboard
    let orderButton = $("ul a li:contains('Orders')");
    orderButton.click();
  }

  await delay(1000);
});

let lastAutoCreateTime, pathUrl;
const delay = ms => new Promi
se(res => setTimeout(res, ms));


chrome.runtime.onMessage.addListener(async (msg, sender, msgRes) => {
    console.log(msg, sender);
    if (msg.action === "Check Flipkart Orders") {
        $("#Orders a div").click();
        await delay(2000);
        
        chrome.runtime.sendMessage({action: "Check Last FK Auto Create Time", type: "Orders"});
        console.log(await handleNavigation());
    } else if (msg.action === "Res - fkOrdersAutoCreate") {
        lastAutoCreateTime = msg.fkOrdersAutoCreate;
        console.log({lastAutoCreateTime});
    } else if (msg.action === "Check Flipkart Returns") {
        window.location.href = "https://seller.flipkart.com/index.html#dashboard/return_orders";

        console.log(await handleReturnNavigation());
    }
});
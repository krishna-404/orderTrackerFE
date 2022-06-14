let pathUrl, orderState;
const delay = ms => new Promise(res => setTimeout(res, ms));

chrome.runtime.onMessage.addListener(async (msg, sender, msgRes) => {
    console.log(msg, sender);
    if (msg.action === "Check Flipkart Orders") {
        $("#Orders a div").click();

        await delay(1000);
        console.log(await handleNavigation());
    }
});

const handleNavigation = async (previousState) => {

    let nextElementMarker;

    switch (previousState) {
        case "shipments_to_pack":
            nextElementMarker = "---";
            previousState = "shipments_upcoming";
            break;
        case "shipments_upcoming":
            nextElementMarker = "Pending RTD";
            previousState = "shipments_to_dispatch";
            break;
        case "shipments_to_dispatch":
            nextElementMarker = "Pending Handover";
            previousState = "shipments_to_handover";
            break;
        case "shipments_to_handover":
            nextElementMarker = "In Transit";
            previousState = "shipments_in_transit";
            break;
        case "shipments_in_transit":
            nextElementMarker = "Pending Services";
            previousState = "pending_services_tab";
            break;
        case "pending_services_tab":
            nextElementMarker = "In last 30 days";
            previousState = "shipments_delivered";
            break;
        case "shipments_delivered":
            return "Flipkart Order Sync Complete";
            break;
        default:
            nextElementMarker = "Pending Labels";
            previousState = "shipments_to_pack";
    };

    //check the number of orders in Element
    let elementSelect = $(`div:contains(${nextElementMarker})`);
    let elementSelectQty = elementSelect.parent().children("div span").text();
    //if Qty>0 navigate to Element
    if(Number(elementSelectQty) > 0) {
        elementSelectQty.click();
        await delay(2000);

        pathUrl = document.location.href;
        let searchParams = new URLSearchParams(pathUrl.split("?")[1]);
        orderState = searchParams.get('orderState');
        console.log({pathUrl, orderState});
    
        if(orderState != "shipments_to_handover"){
            await getOrderIds();
        } else {
            return handlePendingHandover();
        }
    }
    //if Qty = 0 switch to next element
    else {
        console.log({nextElementMarker, previousState});
        return handleNavigation(previousState);
    }
}


// Handle the pending handover tab
const handlePendingHandover = async () => {

}

const getOrderIds = async() => {
    let orderRows = $("tbody tr");
        // console.log(orderRows);

    let pageOrderIds = [];
    let mktplSellerId = "526c336daaea4c94";

    for (let i=0; i<orderRows.length; i++) {
        let orderId = orderRows.eq(i).children("td").eq(0).children("div div").text();
        pageOrderIds.push(orderId);
    }
    
    // Check if the order exists in the system.
    chrome.runtime.sendMessage({pageOrderIds, mktplSellerId, marketplace: "flipkart", action:"Check orders exist"});
    return (orderState);
}
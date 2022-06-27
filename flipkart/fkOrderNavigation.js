let orderState, totalOrdersInTab;


const handleOrderNavigation = async (presentState) => {

    let nextElementMarker;

    switch (presentState) {
        case "shipments_to_pack":
            nextElementMarker = "---";
            presentState = "shipments_upcoming";
            break;
        case "shipments_upcoming":
            nextElementMarker = "Pending RTD";
            presentState = "shipments_to_dispatch";
            break;
        case "shipments_to_dispatch":
            nextElementMarker = "Pending Handover";
            presentState = "shipments_to_handover";
            break;
        case "shipments_to_handover":
            nextElementMarker = "In Transit";
            presentState = "shipments_in_transit";
            break;
        case "shipments_in_transit":
            nextElementMarker = "Pending Services";
            presentState = "pending_services_tab";
            break;
        case "pending_services_tab":
            nextElementMarker = "In last 30 days";
            presentState = "shipments_delivered";
            break;
        case "shipments_delivered":
            return "Flipkart Order Sync Complete";
            break;
        default:
            nextElementMarker = "Pending Labels";
            presentState = "shipments_to_pack";
    };

    //check the number of orders in Element
    let elementSelect = $(`div:contains(${nextElementMarker})`).eq(-2);
    let elementSelectQty = elementSelect.find("div span").last().text();
    // console.log({elementSelect, elementSelectQty});
    //if Qty>0 navigate to Element
    if(Number(elementSelectQty) > 0) {
        elementSelect.click();
        await delay(5000);

        pathUrl = document.location.href;
        let searchParams = new URLSearchParams(pathUrl.split("?")[1]);
        orderState = searchParams.get('orderState');
        console.log({pathUrl, orderState});
    
        if(orderState === "shipments_to_handover"){
            $("tbody tr td").first().click();
            await delay(1000);
        };

        return getOrderIds();
    }
    //if Qty = 0 switch to next element
    else {
        console.log({nextElementMarker, presentState});
        return handleOrderNavigation(presentState);
    }
}

const getOrderIds = async() => {
    let orderRows = $("tbody tr");
        // console.log(orderRows);

    let pageOrderIds = [];
    let mktplSellerId = "526c336daaea4c94";
    console.log(orderRows);
    for (let i=0; i<orderRows.length; i++) {
        let orderId;
        if (orderState === "shipments_to_pack" || orderState === "shipments_to_dispatch" || orderState === "shipments_to_handover"){
            orderId = orderRows.eq(i).children("td").eq(1).children("div div").text();
        } else {
            orderId = orderRows.eq(i).children("td").eq(0).children("div div").text();
        }
        console.log({orderId});
        pageOrderIds.push(orderId);
    }
    
    console.log({pageOrderIds});
    // Check if the order exists in the system.
    chrome.runtime.sendMessage({pageOrderIds, mktplSellerId, marketplaceName: "flipkart", action:"Check orders exist"});
    return (orderState);
}
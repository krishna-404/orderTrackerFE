//navigate to order page

const navigateToOrder = async () => {
    $("#Orders a div").click();

    await delay(1000);
    console.log(await handleNavigation());
}

const handleNavigation = async () => {

    const delay = ms => new Promise(res => setTimeout(res, ms));

    //check the number of orders in pending labels
    let pendingLabelsEl = $("div:contains('Pending Labels')");
    let pendingLabelsQty = pendingLabelsEl.parent().children("div span").text();
    //if >0 navigate to pending labels
    if(pendingLabelsQty > 0) {
        pendingLabelsEl.click();
        await delay(2000);

        //read & input all the orders
        await fkOrderInput();
    }



    //check the number of orders in pending RTD

    //if >0 navigate to pending RTD

    //read & input all the orders



    //check the number of orders in pending handover

    //if >0 navigate to pending handover

    //read & input all the orders



    //check the number of orders in upcoming orders

    //if >0 navigate to upcoming orders

    //read & input all the orders



    //check the number of orders in completed orders

    let completedOrdersEl = $("div:contains('In last 30 days')");

    //if >0 navigate to completed orders
    completedOrdersEl.click();
    await delay(2000);
    
    //read & input all the orders

    return "Flipkart Order Sync Complete"
}

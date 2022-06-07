const fkOrderInput = async () => {
    
    const delay = ms => new Promise(res => setTimeout(res, ms));

    //click orders button to reach orders window.
    /*
    // $("html, body").animate({scrollTop: $(document).height()},1000);
    // $("#listing-modal").animate({scrollTop: $("#listing-modal").scrollTop()},1000);
    $("section").scrollTop($("section").height()+1000);

    let selectRows = $("select[name='default']");
    // console.log(selectRows.first().prop());
    console.log($("select[name='default'] option").last().attr("value"));
    // selectRows.first().click();
    // selectRows.first().val($("select[name='default'] option").last().attr("value")).trigger('change');
    // selectRows.first().trigger('change');
    // selectRows.first().trigger('click');
    // selectRows.first().selectmenu('refresh')
    // selectRows.first().selectmenu('refresh', true);
    */

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

        // chrome.runtime.sendMessage({...orderData, action:"Check order exists"}, async (res) => {
        //     console.log({res});
        //     // orderExists = res.message;
        //     // Scrape order details if doesnt exist
        //     // if(res.message == "Doesn't Exist"){
        //     //     resolve("Doesn't exist");
        //     // } else {
        //     //     resolve("Some Error");
        //     // }
        // })
        
        // if(orderExists === "Doesn't Exist"){
        //     orderData = await scrapeOrderData(orderData, rowItems);
        //     orderData.createdOn = new Date().toISOString();
        //     await chrome.runtime.sendMessage({orderData, action : "Create order"}, res => {
        //         console.log(res);
        //         console.log(new Date().toISOString());
        //     })
        // }
       
    // }

    // return "All Orders Processed";
}

chrome.runtime.onMessage.addListener(async (msg, sender, msgRes) => {
    console.log(msg, sender);
    if(msg.action === "Res - Check orders exist"){
        
    }
})

const scrapeOrderData = async (orderId) => {
    const delay = ms => new Promise(res => setTimeout(res, ms));

    let promotionsButton =  rowItems.eq(1).find('button:contains("Promotions applied")').last();

    if (promotionsButton) {
        promotionsButton.click();
        await delay(500);
        orderData.promotionsApplied = [];     
        let promotionsElement = promotionsButton.parent().parent().children().eq(1).find(":contains('Promotions')").last().parent().children();
        for(let k=1; k<promotionsElement.length; k++) {
            console.log(promotionsElement);
            let promotionDetail = promotionsElement.eq(k).children().eq(0).text();
            console.log(promotionDetail);
            orderData.promotionsApplied.push(promotionDetail);
        }
        promotionsButton.click();
    };
    
    orderIdElement.click();

    let backToListElement = $("button:contains('Back to List')");
    while(!backToListElement[0]){
        console.log(backToListElement);
        await delay(500);
    };

    let orderDetailsElement = backToListElement.parents().eq(2).children().eq(1).children().children().eq(0);

    orderData.orderCreationDate = orderDetailsElement.find("ol li div div:contains('Created')").last().parent().children().eq(1).text();
    orderData.orderApprovalDate = orderDetailsElement.find("ol li div div:contains('Approved')").last().parent().children().eq(1).text();
    orderData.orderPackedDate = orderDetailsElement.find("ol li div div:contains('Packed')").last().parent().children().eq(1).text();
    orderData.orderRtdDate = orderDetailsElement.find("ol li div div:contains('Ready To Dispatch')").last().parent().children().eq(1).text();
    orderData.orderPickupDate = orderDetailsElement.find("ol li div div:contains('Pick up Complete')").last().parent().children().eq(1).text();
    orderData.orderDeliveredDate = orderDetailsElement.find("ol li div div:contains('Delivered')").last().parent().children().eq(1).text();

    orderData.orderStatus = {
        date: new Date().toISOString(),
        status : orderDetailsElement.children().eq(0).children().eq(0).children().eq(3).text()
    };

    orderData.buyerDetails = {
        name: orderDetailsElement.children().eq(0).children().eq(1).children().eq(1).text(),
        address1: orderDetailsElement.children().eq(0).children().eq(1).children().eq(2).text(),
        address2: orderDetailsElement.children().eq(0).children().eq(1).children().eq(3).text(),
        city: orderDetailsElement.children().eq(0).children().eq(1).children().eq(4).text().split(" - ")[0],
        pincode: orderDetailsElement.children().eq(0).children().eq(1).children().eq(4).text().split(" - ")[1],
        state: orderDetailsElement.children().eq(0).children().eq(1).children().eq(5).text()
    };

    orderData.dispatchTrackingDetails = {
        mktplPackageId : orderDetailsElement.find("div:contains('Forward ID:')").last().text().slice(12),
        logisticsPartner: orderDetailsElement.find("div:contains('Logistics Partner:')").last().text().slice(19),
        shipmentId: orderDetailsElement.children().eq(0).children().eq(3).children().eq(1).text().slice(4),
        shipmentMode: orderDetailsElement.children().eq(0).children().eq(4).find("svg").last().parent().children().eq(1).text()
    };

    orderData.paymentMode = orderDetailsElement.children().eq(0).children().eq(3).children().eq(3).text();
    orderData.numberOfProducts = orderDetailsElement.children().eq(2).text().split(" ")[0];
    orderData.productsDetails = [];

    for (let j=1; j<=orderData.numberOfProducts; j++) {

        let productDetailsElement = backToListElement.parents().eq(2).children().eq(1).children().children().eq(j);

        let productDetails = {
            skuId : productDetailsElement.find("div:contains('SKU')").last().parent().children().eq(1).text(),
            itemId : productDetailsElement.find("div:contains('Item Id')").last().parent().children().eq(1).text(),
            fsnId : productDetailsElement.find("div:contains('FSN')").last().parent().children().eq(1).text(),
            hsnCode : productDetailsElement.find("div:contains('HSN')").last().parent().children().eq(1).text(),
            quantity : productDetailsElement.children().eq(1).children().eq(0).find("div:contains('Quantity:')").last().parent().children().eq(1).text().split(" ")[0],
            productAmtCharged : productDetailsElement.children().eq(1).children().eq(0).find("div:contains('Value:')").last().parent().children().eq(1).text().slice(2),
            shippingAmtCharged : productDetailsElement.children().eq(1).children().eq(0).find("div:contains('Shipping:')").last().parent().children().eq(1).text().slice(2),
            totalAmtCharged : productDetailsElement.children().eq(1).children().eq(0).find("div:contains('Total:')").last().parent().children().eq(1).text().slice(2),
            taxAmt : {
                sgst : productDetailsElement.children().eq(1).children().eq(1).find("div:contains('SGST:')").last().parent().children().eq(1).text().slice(2),
                cgst : productDetailsElement.children().eq(1).children().eq(1).find("div:contains('CGST:')").last().parent().children().eq(1).text().slice(2),
                igst : productDetailsElement.children().eq(1).children().eq(1).find("div:contains('IGST:')").last().parent().children().eq(1).text().slice(2),
                totalTax: productDetailsElement.children().eq(1).children().eq(1).find("div:contains('IGST:')").last().parent().children().eq(1).text().slice(2)
            }
        }

        orderData.productsDetails.push(productDetails);
    }   

    console.log(orderData);
    
    backToListElement.click();

    return orderData;
}

fkOrderInput();
chrome.runtime.onMessage.addListener(async (msg, sender, msgRes) => {
  if (
    msg.action === "Res - Check orders exist" &&
    msg.output.marketplaceName == "bijnis"
  ) {
    let { ordersIdsToCreate, nextElementMarker, presentTab } = msg.output;
    console.log(ordersIdsToCreate);
    let ordersDataArray = [];
    //if order exist then scrap them then do the pagination
    let bijnisOrderData;
    if (ordersIdsToCreate[0]) {
      for (let orderIdToCreate of ordersIdsToCreate) {
        bijnisOrderData = await scrapeOrderData(
          orderIdToCreate,
          msg.output.marketplaceName,
          msg.output.mktplSellerId,
          nextElementMarker
        );
        console.log(
          "scrape data should return the data",
          await scrapeOrderData(
            orderIdToCreate,
            msg.output.marketplaceName,
            msg.output.mktplSellerId,
            nextElementMarker,
            presentTab
          )
        );
        // ordersDataArray.push(orderData.orderData);
        if (bijnisOrderData && bijnisOrderData.shippingData) {
          ordersDataArray.push(bijnisOrderData.shippingData);
        }

        console.log(bijnisOrderData);
        console.log(ordersDataArray);
      }
      // chrome.runtime.sendMessage({ ordersDataArray, action: "Create orders" });

      //pagination if it is there, or go to next tab
      let pageDetailsElement = $("div:contains('pages')").last();
      let pageDetails = pageDetailsElement.text().split(" ");
      let currenPage = $("option:selected").last().text();
      if (Number(currenPage) < Number(pageDetails[1])) {
        console.log("pagination");
        pageDetailsElement
          .children()
          .last()
          .children()
          .eq(2)
          .children()
          .click();
        await delay(5000);
        await bijnisGetOrderIds(nextElementMarker);
      } else {
        await bijnisNavigation(nextElementMarker);
      }
      console.log(ordersIdsToCreate);
    }
  }
});

const scrapeOrderData = async (
  orderId,
  marketplaceName,
  mktplSellerId,
  nextElementMarker,
  presentTab
) => {
  console.log("scrapping your data wait plzzz");
  let orderIdElement = $("div table tr")
    .find(`div:contains(${orderId})`)
    .parent()
    .parent();
  console.log(nextElementMarker);
  let orderData = {
    mktplOrderId: orderId,
    marketplaceName: marketplaceName,
    mktplSellerId: mktplSellerId,
    sellerName: "zaureplus",
    type: "orderData",
    // lastAutoCreateTime,
    createdOn: new Date().toISOString(),
  };
  let buyerDetailsElement = orderIdElement.children().eq(0).children().last();
  let buyerDetails;
  buyerDetails = {
    name: buyerDetailsElement.children().eq(1).text(),
    phoneNumber: buyerDetailsElement.children().eq(2).text(),
    address1: buyerDetailsElement.children().eq(3).text(),
  };
  //clicking that buyer history button and scraaping order data
  orderIdElement.find("button:contains('Buyer History')").click();
  let cancellationRate = $("div:contains('Cancellation')")
    .last()
    .children()
    .last()
    .text();
  let RTOrate = $("div:contains('RTO')").last().children().last().text();
  let genuineReturns = $("div:contains('Genuine Returns')")
    .last()
    .children()
    .last()
    .text();
  let nonGenuineReturns = $("div:contains('Non Genuine Returns')")
    .last()
    .children()
    .last()
    .text();
  buyerDetails.cancellationRate = cancellationRate;
  buyerDetails.RTOrate = RTOrate;
  buyerDetails.genuineReturns = genuineReturns;
  buyerDetails.nonGenuineReturns = nonGenuineReturns;
  console.log(orderData);
  let priceAndquantityText = orderIdElement
    .children()
    .eq(1)
    .children()
    .eq(0)
    .children()
    .text();
  orderData.numberOfProductsOrdered = priceAndquantityText.split(/\W+/gm)[2];
  orderData.grandTotalAmtCharged = priceAndquantityText.split(/\W+/gm)[1];
  orderData.subQuantity = priceAndquantityText.split(/\W+/gm)[4];
  orderData.orderStatus = presentTab;
  orderData.shippingData;
  if (
    nextElementMarker === "In Process" ||
    nextElementMarker === "bijnis Order Sync Complete" ||
    nextElementMarker === "Packaging" ||
    nextElementMarker === "Pickup Pending"
  ) {
    orderData.orderCreationDate = orderIdElement
      .children()
      .eq(2)
      .find("span:contains('Placed Date')")
      .parent()
      .children()
      .eq(1)
      .text();
  }
  if (
    presentTab === "Pickup Pending" ||
    presentTab === "Pickup Done" ||
    presentTab === "In Transit" ||
    presentTab === "Completed"
  ) {
    orderData.invoiceNo = orderIdElement
      .find("div:contains('Invoice No')")
      .text()
      .split(/Invoice No/gm)[1];
  }
  //click view items button to get product details
  orderIdElement.children().find("button:Contains('View Items')").click();
  await delay(1000);
  orderData.productsDetails = [];

  let productDetailsElement = $("div:contains('Product Name')").eq(5);
  let totalOrders = productDetailsElement.children;

  for (let i = 0; i < totalOrders.length; i++) {
    let productName = productDetailsElement
      .children()
      .eq(i)
      .find("p:contains('Product Name')")
      .parent()
      .children()
      .eq(1)
      .text();
    let productSetType = productDetailsElement
      .children()
      .eq(i)
      .find("p:contains('Set Type')")
      .parent()
      .children()
      .eq(1)
      .text();
    let subProductQuantity = productDetailsElement
      .children()
      .eq(i)
      .find("p:contains('Order Quantity')")
      .parent()
      .children()
      .eq(1)
      .text()
      .split(/\W+/gm)[0];
    let totalProductAmtCharged = 0;

    //collecting productdata which is grouped in  a lot,
    for (let j = 0; j < subProductQuantity; j++) {
      let articleNo = productDetailsElement
        .children()
        .eq(i)
        .find("p:contains('Article No :')")
        .eq(j)
        .text()
        .split(/Article No : /gm)[1];
      let sizeSet = productDetailsElement
        .children()
        .eq(i)
        .find("p:contains('Size Set : ')")
        .eq(j)
        .text()
        .split(/Size Set : /gm)[1];
      let orderQuantity = productDetailsElement
        .children()
        .eq(i)
        .find("p:contains('Quantity :')")
        .eq(j)
        .text()
        .split(/\D+/gm)[1];
      let amountOfPairs = productDetailsElement
        .children()
        .eq(i)
        .find("p:contains('Quantity :')")
        .eq(j)
        .text()
        .split(/\D+/gm)[2];
      let colour = productDetailsElement
        .children()
        .eq(i)
        .find("p:contains('Colour : ')")
        .eq(j)
        .text()
        .split(/Colour : /gm)[1];
      //click that price side button to open a total view
      productDetailsElement.children().eq(i).find("img").eq(0).click();
      let productAmtCharged = $("tr:contains('Seller Price')")
        .children()
        .last()
        .text()
        .split(/₹/gm)[1];
      let taxAmt = $("tr:contains('Product GST')")
        .children()
        .last()
        .text()
        .split(/₹/gm)[1];
      let promotionAmt = $("tr:contains('Factory Discount')")
        .children()
        .last()
        .text()
        .split(/₹/gm)[1];
      let productDetail = {
        mktplOrderId: orderId,
        productName: productName,
        productSetType: productSetType,
        orderSkuId: `c_${articleNo}_${sizeSet}`,
        orderQuantity: orderQuantity,
        productAmtCharged: productAmtCharged,
        taxAmt: taxAmt,
        promotionAmt: promotionAmt,
        totalAmtCharged:
          (productAmtCharged + taxAmt + promotionAmt) * amountOfPairs,
        colour: colour,
        size: sizeSet,
      };
      orderData.productsDetails.push(productDetail);
    }
    // totalProductAmtCharged += productDetail.productAmtCharged;
  }
  console.log(orderData);
  orderData = {
    ...orderData,
    // totalProductAmtCharged,
  };
  console.log("===orderData ===", orderData);
  let shippingData;
  if (
    nextElementMarker !== "In Process" ||
    nextElementMarker !== "bijnis Order Sync Complete" ||
    nextElementMarker !== "Packaging" ||
    nextElementMarker !== "Pickup Pending"
  ) {
    let trackId = orderIdElement
      .find("div:contains('Waybill Number')")
      .text()
      .split(/Waybill Number/gm)[1];
    let logisticsPartner = orderIdElement
      .find("div:contains('Waybill Number')")
      .text()
      .split(/Waybill Number/gm)[1];
    shippingData = {
      mktplOrderIds: [orderId],
      createdOn: new Date().toISOString(),
      marketplaceName: marketplaceName,
      mktplSellerId: mktplSellerId,
      type: "shippingData",
      buyerDetails: orderData.buyerDetails,
      //trackId = waybillnumber
      trackId: trackId,
      logisticsPartner: logisticsPartner,
      numberOfProductsOrdered: orderData.numberOfProductsOrdered,
      productsDetails: orderData.productsDetails,
      grandTotalAmtCharged,
    };
  }
  if (presentTab === "Pickup Pending") {
    orderIdElement.find("button:contains('View Delivery Details')").click();
    await delay(500);
    let orderPackedDate = $("tr:contains('Request Pickup On:')")
      .children()
      .eq(1)
      .text();
    let orderConfirmationDate = $("tr:contains('Confirmed On:')")
      .children()
      .eq(1)
      .text();
    shippingData.shipmentPackedDate = orderPackedDate;
    shippingData.shipmentConfirmationDate = orderConfirmationDate;
  } else if (presentTab === "Pickup Done") {
    //waiting for order to go in that tab
  } else if (presentTab === "In Transit") {
    orderIdElement.find("button:contains('Track Order Status')").click();
    await delay(500);
    let orderPickupDate = $("tr:contains('Pickup Done On:')")
      .children()
      .eq(1)
      .text();
    let dispatchDate = $("tr:contains('Dispatched On:')")
      .children()
      .eq(1)
      .text();
    let destinationDate = $("tr:contains('Arrived at Destination On:')")
      .children()
      .eq(1)
      .text();
    shippingData.shipmentPickedDate = orderPickupDate;
    shippingData.shipmentDispatchDate = dispatchDate;
    shippingData.shipmentDestinationDate = destinationDate;
  } else if (presentTab === "Completed") {
    let DeliveredDate = orderIdElement
      .find("div:contains('Delivered To Buyer:')")
      .last()
      .text()
      .split(/Delivered To Buyer: /gm)[1];
    orderIdElement.find("button:contains('View Delivery Details')").click();
    await delay(500);
    let outOfDeliveryDate = $("tr:contains('Out for Delivery On:')")
      .children()
      .eq(1)
      .text();
    shippingData.shipmentDeliveredDate = DeliveredDate;
    shippingData.shipmentOutOfDeliveryDate = outOfDeliveryDate;
  } else if (presentTab === "Cancelled") {
    let orderCancellationDate = orderIdElement
      .find("div:contains('Cancelled On :')")
      .last()
      .text()
      .split(/Cancelled On :/gm)[1];
    shippingData.shipmentCancellationDate = orderCancellationDate;
  }

  return { orderData, shippingData, buyerDetails };
};

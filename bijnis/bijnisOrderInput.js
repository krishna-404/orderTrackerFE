chrome.runtime.onMessage.addListener(async (msg, sender, msgRes) => {
  if (
    msg.action === "Res - Check orders exist" &&
    msg.output.marketplaceName == "bijnis"
  ) {
    let { ordersIdsToCreate, nextElementMarker } = msg.output;
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
            nextElementMarker
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
  nextElementMarker
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
  orderData.buyerDetails = {
    name: buyerDetailsElement.children().eq(1).text(),
    phoneNumber: buyerDetailsElement.children().eq(2).text(),
    address1: buyerDetailsElement.children().eq(3).text(),
  };
  console.log(orderData);
  let priceAndquantityText = orderIdElement
    .children()
    .eq(1)
    .children()
    .eq(0)
    .children()
    .text();
  orderData.numberOfProductsOrdered = priceAndquantityText.split(/\W+/gm)[2];
  orderData.totalProductAmtCharged = priceAndquantityText.split(/\W+/gm)[1];
  orderData.subQuantity = priceAndquantityText.split(/\W+/gm)[4];
  orderData.orderCreationDate = orderIdElement
    .children()
    .eq(2)
    .find("span:contains('Placed Date')")
    .parent()
    .children()
    .eq(1)
    .text();
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
        .split(/\D+/gm)[0];
      //click that price side button to open a total view
      let productAmtCharged = productDetailsElement
        .children()
        .eq(i)
        .find("div:contains('Bijnis Price')");
      let productDetail = {
        mktplOrderId: orderId,
        orderSkuId: `c_${articleNo}_${sizeSet}`,
        orderQuantity: orderQuantity,
        productAmtCharged: "365",
        taxAmt: "total gst amt",
        promotionAmt: "factorydiscount",
        totalAmtCharged:
          (productAmtCharged + taxAmt + promotionAmt) * "amount of pairs",
        colour: "somthing",
        size: "",
      };
    }
  }
  return orderData;
};

// let pathUrl, orderState;
// const delay = ms => new Promise(res => setTimeout(res, ms));

chrome.runtime.onMessage.addListener(async (msg, sender, msgRes) => {
  console.log(msg, sender);
  if (msg.action === "Res - Check orders exist") {
    let { ordersIdsToCreate } = msg.output;
    let ordersDataArray = [];

    // If none of the orders in the page are to be created then stop pagination.
    if (ordersIdsToCreate[0]) {
      for (let orderIdToCreate of ordersIdsToCreate) {
        let orderData = await scrapeOrderData(
          orderIdToCreate,
          msg.output.marketplaceName,
          msg.output.mktplSellerId
        );
        ordersDataArray.push(orderData.orderData);
        if (orderData.shippingData) {
          ordersDataArray.push(orderData.shippingData);
        }
      }
      console.log(ordersDataArray);
      chrome.runtime.sendMessage({ ordersDataArray, action: "Create orders" });

      //check pagination status
      let pageDetailsElement = $("div span:contains('pages')").last();
      let pageDetails = pageDetailsElement.text().split(" ");
      console.log({ pageDetails });
      if (Number(pageDetails[0]) < Number(pageDetails[2])) {
        //navigate to new page in pagination
        pageDetailsElement.parent().children("i").last().click();
        await delay(5000);
        console.log(await getOrderIds());
      } else {
        console.log(await handleNavigation(orderState));
      }
    }
  }
});

const scrapeOrderData = async (orderId, marketplaceName, mktplSellerId) => {
  let orderIdElement = $("tbody tr").find(`div:contains(${orderId})`).last();
  let orderRow = orderIdElement.closest("tr").first();
  console.log({ orderId, orderRow });

  let promotionsButton = orderRow
    .find('button:contains("Promotions applied")')
    .last();
  console.log({ promotionsButton });

  let orderData = {
    mktplOrderId: orderId,
    marketplaceName: marketplaceName,
    mktplSellerId: mktplSellerId,
    sellerName: "zaureplus",
    type: "orderData",
    lastAutoCreateTime,
    createdOn: new Date().toISOString(),
  };
  console.log({ orderData });

  if (promotionsButton) {
    promotionsButton.click();
    await delay(500);
    orderData.promotionsApplied = [];
    let promotionsElement = promotionsButton
      .parent()
      .parent()
      .children()
      .eq(1)
      .find(":contains('Promotions')")
      .last()
      .parent()
      .children();
    for (let k = 1; k < promotionsElement.length; k++) {
      // console.log(promotionsElement);
      let promotionDetail = promotionsElement.eq(k).children().eq(0).text();
      // console.log(promotionDetail);
      orderData.promotionsApplied.push(promotionDetail);
    }
    promotionsButton.click();
  }

  orderIdElement.click();
  console.log({ orderId }, "clicked ------");
  await delay(1500);

  let backToListElement = $("button:contains('Back to List')");
  while (!backToListElement[0]) {
    console.log(backToListElement);
    await delay(500);
  }

  let orderDetailsElement = $("div:contains('Buyer Details')").parents().eq(2);
  console.log({ orderDetailsElement });

  orderData.orderCreationDate = orderDetailsElement
    .find("ol li div div:contains('Created')")
    .last()
    .parent()
    .children()
    .eq(1)
    .text();
  orderData.orderApprovalDate = orderDetailsElement
    .find("ol li div div:contains('Approved')")
    .last()
    .parent()
    .children()
    .eq(1)
    .text();

  orderData.orderStatus = [
    {
      date: new Date().toISOString(),
      status: orderDetailsElement
        .children()
        .eq(0)
        .children()
        .eq(0)
        .children()
        .eq(3)
        .text(),
    },
  ];

  const buyerDetailsElement = orderDetailsElement
    .find("div:contains('Buyer Details')")
    .last()
    .parent();
  orderData.buyerDetails = {
    name: buyerDetailsElement.children().eq(1).text(),
    address1: buyerDetailsElement.children().eq(2).text(),
    address2: buyerDetailsElement.children().eq(3).text(),
    city: buyerDetailsElement.children().eq(4).text().split(" - ")[0],
    pincode: buyerDetailsElement.children().eq(4).text().split(" - ")[1],
    state: buyerDetailsElement.children().eq(5).text(),
  };

  const shipmentDetailsElement = orderDetailsElement
    .find("div:contains('Shipment Details')")
    .last()
    .parent();
  console.log({ shipmentDetailsElement });

  orderData.paymentMode = shipmentDetailsElement.children().eq(3).text();
  orderData.numberOfProductsOrdered = orderDetailsElement
    .children()
    .eq(2)
    .text()
    .split(" ")[0];
  orderData.productsDetails = [];
  let totalProductAmtCharged = 0,
    totalShippingAmtCharged = 0,
    grandTotalAmtCharged = 0;
  let totalTaxAmt = { sgst: 0, cgst: 0, igst: 0, totalTax: 0 };

  for (let j = 1; j <= orderData.numberOfProductsOrdered; j++) {
    let productDetailsElement = $("div:contains('Tax Breakup')")
      .parents()
      .eq(2);

    let productDetails = {
      mktplOrderId: orderId,
      orderSkuId: productDetailsElement
        .find("div:contains('SKU')")
        .last()
        .parent()
        .children()
        .eq(1)
        .text(),
      orderItemId: productDetailsElement
        .find("div:contains('Item Id')")
        .last()
        .parent()
        .children()
        .eq(1)
        .text(),
      orderFsnId: productDetailsElement
        .find("div:contains('FSN')")
        .last()
        .parent()
        .children()
        .eq(1)
        .text(),
      orderHsnCode: productDetailsElement
        .find("div:contains('HSN')")
        .last()
        .parent()
        .children()
        .eq(1)
        .text(),
      orderQuantity: productDetailsElement
        .children()
        .eq(1)
        .children()
        .eq(0)
        .find("div:contains('Quantity:')")
        .last()
        .parent()
        .children()
        .eq(1)
        .text()
        .split(" ")[0],
      productAmtCharged: Number(
        productDetailsElement
          .children()
          .eq(1)
          .children()
          .eq(0)
          .find("div:contains('Value:')")
          .last()
          .parent()
          .children()
          .eq(1)
          .text()
          .slice(2)
      ),
      shippingAmtCharged: Number(
        productDetailsElement
          .children()
          .eq(1)
          .children()
          .eq(0)
          .find("div:contains('Shipping:')")
          .last()
          .parent()
          .children()
          .eq(1)
          .text()
          .slice(2)
      ),
      totalAmtCharged: Number(
        productDetailsElement
          .children()
          .eq(1)
          .children()
          .eq(0)
          .find("div:contains('Total:')")
          .last()
          .parent()
          .children()
          .eq(1)
          .text()
          .slice(2)
      ),
      taxAmt: {
        sgst: Number(
          productDetailsElement
            .children()
            .eq(1)
            .children()
            .eq(1)
            .find("div:contains('SGST:')")
            .last()
            .parent()
            .children()
            .eq(1)
            .text()
            .slice(2)
        ),
        cgst: Number(
          productDetailsElement
            .children()
            .eq(1)
            .children()
            .eq(1)
            .find("div:contains('CGST:')")
            .last()
            .parent()
            .children()
            .eq(1)
            .text()
            .slice(2)
        ),
        igst: Number(
          productDetailsElement
            .children()
            .eq(1)
            .children()
            .eq(1)
            .find("div:contains('IGST:')")
            .last()
            .parent()
            .children()
            .eq(1)
            .text()
            .slice(2)
        ),
        totalTax: Number(
          productDetailsElement
            .children()
            .eq(1)
            .children()
            .eq(1)
            .find("div:contains('IGST:')")
            .last()
            .parent()
            .children()
            .eq(1)
            .text()
            .slice(2)
        ),
      },
    };

    totalProductAmtCharged += productDetails.productAmtCharged;
    totalShippingAmtCharged += productDetails.shippingAmtCharged;
    grandTotalAmtCharged += productDetails.totalAmtCharged;
    totalTaxAmt.sgst += productDetails.taxAmt.sgst;
    totalTaxAmt.cgst += productDetails.taxAmt.cgst;
    totalTaxAmt.igst += productDetails.taxAmt.igst;
    totalTaxAmt.totalTax += productDetails.taxAmt.totalTax;

    orderData.productsDetails.push(productDetails);
  }

  orderData = {
    ...orderData,
    totalProductAmtCharged,
    totalShippingAmtCharged,
    grandTotalAmtCharged,
    totalTaxAmt,
  };

  let shippingData;
  if (
    orderState !== "shipments_to_pack" &&
    orderState !== "shipments_upcoming"
  ) {
    shippingData = {
      mktplOrderIds: [orderId],
      createdOn: new Date().toISOString(),
      marketplaceName: marketplaceName,
      mktplSellerId: mktplSellerId,
      type: "shippingData",
      orderStatus: orderData.orderStatus,
      buyerDetails: orderData.buyerDetails,
      mktplShipmentId: shipmentDetailsElement.children().eq(1).text().slice(4),
      shipmentMode: orderDetailsElement
        .children()
        .eq(0)
        .find("svg")
        .last()
        .parent()
        .children()
        .eq(1)
        .text(),
      paymentMode: orderData.paymentMode,
      numberOfProductsOrdered: orderData.numberOfProductsOrdered,
      productsDetails: orderData.productsDetails,
      grandTotalAmtCharged,
    };

    shippingData.orderPackedDate = orderDetailsElement
      .find("ol li div div:contains('Packed')")
      .last()
      .parent()
      .children()
      .eq(1)
      .text();
    if (orderState !== "shipments_to_dispatch") {
      shippingData.orderRtdDate = orderDetailsElement
        .find("ol li div div:contains('Ready To Dispatch')")
        .last()
        .parent()
        .children()
        .eq(1)
        .text();
      if (orderState !== "shipments_to_handover") {
        shippingData.orderPickupDate = orderDetailsElement
          .find("ol li div div:contains('Pick up Complete')")
          .last()
          .parent()
          .children()
          .eq(1)
          .text();
        (shippingData.mktplTrackingId = orderDetailsElement
          .find("div:contains('Forward ID:')")
          .last()
          .text()
          .slice(12)),
          (shippingData.logisticsPartner = orderDetailsElement
            .find("div:contains('Logistics Partner:')")
            .last()
            .text()
            .slice(19));

        if (orderState === "shipments_delivered") {
          shippingData.orderDeliveredDate = orderDetailsElement
            .find("ol li div div:contains('Delivered')")
            .last()
            .parent()
            .children()
            .eq(1)
            .text();
        }
      }
    }
  }

  // console.log(orderData);
  // await delay(1500);

  backToListElement.click();

  return { orderData, shippingData };
};

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

const bijnisNavigation = async (presentTab) => {
  console.log("checking tab navigations");
  await delay(5000);
  let nextElementMarker;

  //check the number of orders in element, if they are greater then 0 then click on them else go to the next tab

  switch (presentTab) {
    case "In Process":
      presentTab = "In Process";
      nextElementMarker = "Packaging";
      break;
    case "Packaging":
      presentTab = "Packaging";
      nextElementMarker = "Pickup Pending";
      break;
    case "Pickup Pending":
      presentTab = "Packaging";
      nextElementMarker = "Pickup Done";
      break;
    case "Pickup Done":
      presentTab = "Pickup Done";
      nextElementMarker = "In Transit";
      break;
    case "In Transit":
      presentTab = "In Transit";
      nextElementMarker = "Completed";
      break;
    case "Completed":
      presentTab = "Completed";
      nextElementMarker = "Cancelled";
      break;
    case "Cancelled":
      presentTab = "Cancelled";
      nextElementMarker = "bijnis Order Sync Complete";
      break;
    default:
      presentTab = "New Orders";
      nextElementMarker = "In Process";
      break;
  }

  let tab = $(`div:contains(${presentTab})`).eq(11);
  let tabName = $(tab)
    .text()
    .split(/(\(\d+\))/gm)[0];
  let orderQuantity = $(tab)
    .text()
    .split(/(\(\d+\))/gm)[1]
    .split(/(\d+)/gm)[1];
  console.log({ tabName, orderQuantity });
  if (orderQuantity > 0) {
    console.log(tabName);
    $(tab).click();
    await bijnisGetOrderIds(nextElementMarker, presentTab);
  } else if (nextElementMarker != "bijnis Order Sync Complete") {
    console.log({ nextElementMarker, presentTab });
    return bijnisNavigation(nextElementMarker);
  }
};

const bijnisGetOrderIds = async (nextElementMarker, presentTab) => {
  await delay(5000);
  let orderRows = $("table tr");
  let pageOrderIds = [];
  let mktplSellerId = "526c336daaea4c94";
  for (let i = 0; i < orderRows.length; i++) {
    let orderId;
    orderId = orderRows
      .eq(i)
      .children("td")
      .eq(0)
      .children("div")
      .children("p:contains('Order Id')")
      .text()
      .split(/Order Id:/gm)[1];

    // console.log(orderId);
    pageOrderIds.push(orderId);
  }
  console.log("next elemnt ", nextElementMarker);
  console.log(pageOrderIds);
  //   console.log({ orderRows });
  console.log("hello from getorderid");
  chrome.runtime.sendMessage({
    pageOrderIds,
    mktplSellerId,
    marketplaceName: "bijnis",
    action: "Check orders exist",
    nextElementMarker,
    presentTab,
  });
};

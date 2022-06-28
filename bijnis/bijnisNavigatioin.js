let orderState, totalOrdersInTab;

const tabsNavigation = (presentTab) => {
  console.log("checking tab navigations");
  let nextTab;

  switch (presentTab) {
    case "New Orders":
      nextTab = "";
      break;

    default:
      nextTab = "New Orders";
      presentTab = "New Orders";
      break;
  }

  //check the number of orders in element, if they are greater then 0 then click on them else go to the next tab

  let currentElement = $(`div:contains(${presentTab})`);
  console.log(currentElement);
};

tabsNavigation();

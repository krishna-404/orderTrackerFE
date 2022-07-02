console.log("From background");
// console.log(chrome.tabs.query({currentWindow: true})); --> Get all open tabs in current window.

let config = {
  apiUrl: "http://localhost:1729",
};

chrome.runtime.onMessage.addListener(async (msg, sender, msgRes) => {
  console.log(msg, sender);

  if (msg.action === "Check orders exist") {
    let apiUrl = `${config.apiUrl}/order/exists/`;
    console.log(apiUrl);

    const fetchReq = {
      method: "POST",
      mode: "cors",
      cache: "no-cache",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(msg),
    };
    console.log({ fetchReq });
    fetch(apiUrl, fetchReq)
      .then(async (apiRes) => {
        console.log(apiRes);

        if (apiRes.status !== 200) {
          console.log({
            status: "Error",
            message:
              "Looks like there was a problem. Status Code: " + apiRes.status,
          });
        }

        apiRes.json().then((output) => {
          console.log(output);
          // chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
          //     chrome.tabs.sendMessage(tabs[0].id, {greeting: "hello"}, function(response) {
          //       console.log(response.farewell);
          //     });
          //   });
          chrome.tabs.sendMessage(sender.tab.id, {
            output,
            action: "Res - Check orders exist",
          });
        });
      })
      .catch((err) => {
        console.log("error in fecth", { err });
      });
  } else if (msg.action === "Create orders") {
    let apiUrl = `${config.apiUrl}/orders/create`;
    console.log(apiUrl);
    fetch(apiUrl, {
      method: "POST",
      mode: "cors",
      cache: "no-cache",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(msg.ordersDataArray),
    }).then((apiRes) => {
      console.log(apiRes, apiRes.json());
    });
  } else if (msg.action === "Check Last FK Auto Create Time") {
    let apiUrl = `${config.apiUrl}/lastOrderAutoUpdate/fkOrdersAutoCreate`;
    console.log({ apiUrl });
    fetch(apiUrl).then((result) => {
      console.log({ result });
      chrome.tabs.sendMessage(sender.tab.id, {
        result,
        action: "Res - fkOrdersAutoCreate",
      });
    });
  }
});

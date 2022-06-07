console.log("From background");
// console.log(chrome.tabs.query({currentWindow: true})); --> Get all open tabs in current window.

let config = {
    apiUrl : "http://localhost:1729"
}

chrome.runtime.onMessage.addListener(async (msg, sender, msgRes) => {
    console.log(msg, sender);

    if(msg.action === "Check orders exist") {
        let apiUrl = `${config.apiUrl}/order/exists/`;
        console.log(apiUrl); 
        fetch(apiUrl, {
            method: 'POST',
            mode: 'no-cors',
            cache: 'no-cache',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(msg)
        }).then(async apiRes => {
            console.log(apiRes);

            if (apiRes.status !== 200) {
                console.log({status: "Error", message:'Looks like there was a problem. Status Code: ' +
                apiRes.status });
            }

            apiRes.json().then((output) => {
                console.log(output);
                chrome.runtime.sendMessage({output, action:"Res - Check orders exist"})          
            });
        }).catch(err => {
            console.log("error in fecth", {err})
        })
    } else if (req.action === "Create order") {
        let apiUrl = `${config.apiUrl}/order/create`;
        console.log(apiUrl); 
        fetch(apiUrl, {
            method: 'POST',
            mode: 'no-cors',
            cache: 'no-cache',
            headers: {
                'Content-Type': 'application/json'
            },            
            body: JSON.stringify(req.orderData)
        }).then(apiRes => {
            console.log(apiRes, apiRes.json());

            if(apiRes.status !== 200) {
                msgRes({status: "Error", message:"Some problem with creating order." });
            }

            msgRes(apiRes.json());
        })
    }
})
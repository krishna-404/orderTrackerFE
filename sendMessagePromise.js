const  sendMessagePromise = (item) => {
    return new Promise ((resolve, reject) => {    
        chrome.runtime.sendMessage(item, async (res) => {
            console.log({res})

            // Scrape order details if doesnt exist
            if(res && res.message == "Doesn't Exist"){
                resolve("Doesn't exist");
            } else {
                resolve("Some Error");
            }
        })
    })
}
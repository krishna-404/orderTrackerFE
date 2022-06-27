const { listenerCount } = require("process");

const handleReturnNavigation = async(presentState) => {

    await delay(5000);

    let returnDetailsEl = $("div.row > div.return-order > div.return-list");
    console.log({returnDetailsEl});

    if (returnDetailsEl) {
        returnDetailsEl.find("ul.fk-list").children();
    };

    let navbarEl = $("div.returns-navbar-container");
    let selectedTabEl = navbarEl.find("li.selected");
    let selectedSubTabEl = $("div.return-sub-nav-container > div > ul > li.selected");

    switch (selectedTabEl.children("span").first().text()) {
        case "Approved":
            navbarEl.find("li span:contains('In Transit')").last().click();
            break;
        case "In Transit":
            if(selectedSubTabEl.children("span").first().text() === "Picked Up") {
                selectedSubTabEl.parent().children("li").last().click();
            } else {
                navbarEl.find("li span:contains('Completed')").last().click();
            }
            break;
        case "Completed":
            if(selectedSubTabEl.children("span").first().text() === "Delivered") {
                selectedSubTabEl.parent().children("li").last().click();
            } else {
                return ('Returns data entry complete');
            }
            break;
    }
}
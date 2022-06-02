chrome.runtime.sendMessage({message: "FK Button Clicked"}, res => {
    console.log(res);
});

const delay = ms => new Promise(res => setTimeout(res, ms));


const fkOrderInput = async () => {
    //click orders button to reach orders window.
    /*
    $("#Orders a div").click();

    await delay(1000);
    let completedOrdersEl = $("div:contains('In last 30 days')");

    //Navigate to Completed Orders
    completedOrdersEl.click();

    console.log(new Date().toISOString());
    await delay(2000);
    console.log(new Date().toISOString());
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

    for (let i=0; i<orderRows.length; i++) {
        let rowItems = orderRows.eq(i).children("td");
        let orderData = {};

        orderData.orderId = rowItems.eq(0).children("div div").text();
        console.log(orderData);
        // orderData.skuId = rowItems.eq(1).children(":contains('SKU:'):last-child").parent();
        orderData.skuId = rowItems.eq(1).find(":contains('SKU:')").last().parent().children().eq(1).text();
        orderData.itemId = rowItems.eq(1).find(":contains('Item Id:')").last().parent().children().eq(1).text();
        orderData.fsn = rowItems.eq(1).find(":contains('FSN:')").last().parent().children().eq(1).text();
        orderData.quantity = rowItems.eq(1).find(":contains('Quantity:')").last().parent().children().eq(1).text();
        orderData.productLink = rowItems.eq(1).find("span a").last()[0].href;
        
        let promotionsButton =  rowItems.eq(1).find('button:contains("Promotions applied")').last();
        promotionsButton.click();
        await delay(500);

        if (promotionsButton) {
            orderData.promotionsApplied = [];     
            let promotionsElement = promotionsButton.parent().parent().children().eq(1).find(":contains('Promotions')").last().parent().children();
            for(let k=1; k<promotionsElement.length; k++) {
                console.log(promotionsElement);
                let promotionDetail = promotionsElement.eq(k).children().eq(0).text();
                console.log(promotionDetail);
                orderData.promotionsApplied.push(promotionDetail);
            }
        }
        // .parent().children().eq(1).text();
        console.log(orderData);
        promotionsButton.click();
    }


}

fkOrderInput();

export function updateCartCount(countId, cartCount) {
    let countElement = document.getElementById(countId)
    countElement.textContent = cartCount
}

export async function api(url,body,method) {
    const response = await fetch(url,{
        method: method,
        headers:{'Content-Type': 'application/json'},
        body: JSON.stringify(body)
    })
    return response.json()
}

export function formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 2
    }).format(amount);
}

export async  function  updatePlaceOrder(itemId,amountId,data) {
    let itemElement = document.getElementById(itemId);
    let amountElement = document.getElementById(amountId);
    itemElement.textContent = data.totalQuantity;
    amountElement.textContent = formatCurrency(data.totalAmount);
}

export async function openRazorpayPayment(order){
    var options = {
        "key": "rzp_test_RfgguYZ2GMISWh",
        "amount": order.amount,
        "currency": "INR",
        "name": "Shopping cart", //your business name
        "order_id": order.id,
        "callback_url": "/razorpay/callback",
        prefill: {
            name: order.name,
            contact: order.mobile
        }
    }
    const rzp = new Razorpay(options);
    rzp.open();
}


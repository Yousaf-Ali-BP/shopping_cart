export function updateCartCount(countId, cartCount) {
    let countElement = document.getElementById(countId)
    countElement.textContent = cartCount
}

export async function apiGET(endPoint, productId) {
    const response = await fetch(`/${endPoint}/${productId}`);
    let data = await response.json();
    return data
}

export async function api(url,body,method) {
    const response = await fetch(url,{
        method: method,
        headers:{'Content-Type': 'application/json'},
        body: JSON.stringify(body)
    })
    return response.json()
}
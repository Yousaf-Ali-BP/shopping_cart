import * as helpers from "./utils/helpers.js";

export function viewImage(event) {
    document.getElementById("imageView").src = URL.createObjectURL(event.target.files[0]);
}

export async function addToCart(productId) {
    try {
        const data = await helpers.api('/add-to-cart', {productId}, 'POST');
        if (data.status) {
            helpers.updateCartCount('cart-count', data.cartCount);
        } else {
            window.location.href = data.redirect;
        }
    } catch (err) {
        console.log(err);
    }
}

export async function removeFromCart(productId) {
    try {
        const data = await helpers.api('/remove-from-cart', {productId}, 'DELETE');
        if (data.status) {
            document.getElementById(`cartProduct-${productId}`).remove()
            helpers.updateCartCount('cart-count', data.cartCount);
            await helpers.updatePlaceOrder('total-quantity', 'total-amount', data.data)
        } else {
            window.location.href = data.redirect;
        }
    } catch (err) {
        console.log(err);
    }
}

export async function incrementCartQuantity(productId) {
    try {
        const data = await helpers.api('/increment-cart-quantity', {productId}, 'PATCH');
        if (data.status) {
            helpers.updateCartCount(`cart-count-${productId}`, data.cartProductCount);
            helpers.updateCartCount('cart-count', data.cartCount);
            const minusButton = document.querySelector(`.btn-minus[data-id="${productId}"]`);
            if (minusButton) minusButton.disabled = data.cartProductCount <= 1;
            await helpers.updatePlaceOrder('total-quantity', 'total-amount', data.data)

        } else {
            window.location.href = data.redirect;
        }
    } catch (err) {
        console.log(err);
    }
}

export async function decrementCartQuantity(productId) {
    try {
        const data = await helpers.api('/decrement-cart-quantity', {productId}, 'PATCH');
        if (data.status) {
            helpers.updateCartCount(`cart-count-${productId}`, data.cartProductCount);
            helpers.updateCartCount('cart-count', data.cartCount);
            const minusButton = document.querySelector(`.btn-minus[data-id="${productId}"]`);
            if (minusButton) minusButton.disabled = data.cartProductCount <= 1;

            await helpers.updatePlaceOrder('total-quantity', 'total-amount', data.data)

        } else {
            window.location.href = data.redirect;
        }
    } catch (err) {
        console.log(err);
    }
}

export async function checkoutForm(formData) {
    try {
        let data = await helpers.api('/place-order', formData,'POST');
        if(data.status===true){
            window.location.href = '/order-confirmed'
        }else {
            helpers.openRazorpayPayment(data)
        }

    } catch (err) {
        console.log(err);
    }

}

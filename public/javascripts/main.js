import * as shop from "./shop.js";


document.addEventListener('DOMContentLoaded', () => {

    // Disable minus buttons where quantity is 1
    document.querySelectorAll('.btn-minus').forEach(button => {
        const productId = button.dataset.id;
        const quantityElement = document.getElementById(`cart-count-${productId}`);
        if (Number(quantityElement.textContent) <= 1) {
            button.disabled = true;
        }
    });

    // Image preview
    const imageInput = document.getElementById('imageInput');
    if (imageInput) {
        imageInput.addEventListener('change', shop.viewImage);
    }

    //Add To Cart
    document.querySelectorAll('.btn-add-cart').forEach(button => {
        button.addEventListener('click', event => {
            const productId = event.target.dataset.id;
            shop.addToCart(productId);
        })
    })

    //Remove From Cart
    document.querySelectorAll('.btn-remove-cart').forEach(button => {
        button.addEventListener('click', event => {
            const productId = event.currentTarget.dataset.id;
            shop.removeFromCart(productId);
        })
    })

    //Cart Button Plus
    document.querySelectorAll('.btn-plus').forEach(button => {
        button.addEventListener('click', event => {
            const productId = event.target.dataset.id;
            shop.incrementCartQuantity(productId);
        })
    })

    //Cart Button Minus
    document.querySelectorAll('.btn-minus').forEach(button => {
        button.addEventListener('click', event => {
            const productId = event.target.dataset.id;
            shop.decrementCartQuantity(productId);
        })
    })

    //Place Order Form
    document.getElementById('checkout-form').addEventListener('submit', async (event) => {
        event.preventDefault();
        const formData = new FormData(event.target);
        const formObject = Object.fromEntries(formData.entries());
        shop.checkoutForm(formObject);
    })


});
import * as shop from "./shop.js";


document.addEventListener('DOMContentLoaded', () => {

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


});
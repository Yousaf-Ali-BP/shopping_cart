const express = require('express');
const router = express.Router();
const productHelpers = require('../helpers/product-helpers')
const userHelpers = require('../helpers/user-helpers')
const {response} = require("express");

const verifyLoginfetch = (req, res, next) => {
    if (req.session.loggedIn) {
        next()
    } else {
        res.json({status: false, redirect: '/login'})
    }
}

const verifyLogin = (req, res, next) => {
    if (req.session.loggedIn) {
        next()
    } else {
        res.redirect('/login')
    }
}

/* GET home page. */
router.get('/', async function (req, res) {
    const user = req.session.user;
    let cartCount = null
    if (user) {
        cartCount = await userHelpers.getCartCount(user._id)
    }
    productHelpers.getAllProducts().then(products => {
        products = productHelpers.formatCurrency(products, 'price')
        res.render('user/view-products', {products, user, cartCount});
    })
});


//User Auth
router.get('/login', function (req, res) {
    if (req.session.loggedIn) {
        res.redirect('/');
    } else {
        res.render('user/login', {loginError: req.session.loginError});
        req.session.loginError = false;
    }
})
router.get('/signup', function (req, res) {
    if (req.session.loggedIn) {
        res.redirect('/');
    } else {
        res.render('user/signup', {signupError: req.session.signupError});
    }

})
router.post('/signup', function (req, res) {
    userHelpers.dosignup(req.body).then(response => {
        if (response.status) {
            req.session.loggedIn = true;
            req.session.user = response.user;
            res.redirect('/');
        } else {
            req.session.signupError = 'This email is already registered. Please log in or use another email.'
            res.redirect('/signup')
        }


    })
})
router.post('/login', function (req, res) {
    userHelpers.dologin(req.body).then(response => {
        if (response.status) {
            req.session.loggedIn = true;
            req.session.user = response.user;
            res.redirect('/');
        } else {
            req.session.loginError = 'Invalid Email or Password !'
            res.redirect('/login')
        }
    })
})
router.get('/logout', function (req, res) {
    req.session.destroy();
    res.redirect('/');
})


//cart
router.get('/cart', verifyLogin, async function (req, res) {
    const user = req.session.user;
    let cartCount = null
    if (user) {
        cartCount = await userHelpers.getCartCount(user._id)
    }
    let result = await userHelpers.getTotalAmount(req.session.user._id)
    result = productHelpers.formatCurrency(result, 'totalAmount')
    const data = result[0]
    userHelpers.getCartProducts(req.session.user._id).then(products => {
        products = productHelpers.formatCurrency(products, 'price')
        res.render('user/cart', {products, user, cartCount, data});
    })

})

router.post('/add-to-cart', verifyLoginfetch, async function (req, res) {
    try {
        await userHelpers.addToCart(req.body.productId, req.session.user._id)
        const cartCount = await userHelpers.getCartCount(req.session.user._id)
        res.json({status: true, cartCount})
    } catch (err) {
        console.log(err)
        res.json({status: false})
    }

})

router.delete('/remove-from-cart', verifyLoginfetch, async function (req, res) {
    try {
        const user = req.session.user;
        await userHelpers.removeFromCart(req.body.productId, user._id)
        const cartCount = await userHelpers.getCartCount(user._id)
        let result = await userHelpers.getTotalAmount(user._id)
        result = await productHelpers.formatCurrency(result, 'totalAmount')
        const data = result[0]

        res.json({status: true, cartCount, data})
    } catch (err) {
        console.log(err)
    }

})

router.patch('/increment-cart-quantity', verifyLoginfetch, async function (req, res) {
    try {
        const user = req.session.user;
        let cartProductCount = await userHelpers.incrementCartQuantity(req.body.productId, user._id)
        const cartCount = await userHelpers.getCartCount(user._id)
        let result = await userHelpers.getTotalAmount(user._id)
        result = await productHelpers.formatCurrency(result, 'totalAmount')
        const data = result[0]

        res.json({status: true, cartCount, cartProductCount, data})
    } catch (err) {
        console.log(err)
    }

})

router.patch('/decrement-cart-quantity', verifyLoginfetch, async function (req, res) {
    try {
        const user = req.session.user;
        let cartProductCount = await userHelpers.decrementCartQuantity(req.body.productId, user._id)
        const cartCount = await userHelpers.getCartCount(user._id)
        let result = await userHelpers.getTotalAmount(user._id)
        result = await productHelpers.formatCurrency(result, 'totalAmount')
        const data = result[0]

        res.json({status: true, cartCount, cartProductCount, data})
    } catch (err) {
        console.log(err)
    }

})


//Order
router.get('/place-order', verifyLogin, async function (req, res) {
    try {
        const user = req.session.user;
        let result = await userHelpers.getTotalAmount(user._id)
        result = await productHelpers.formatCurrency(result, 'totalAmount')
        const data = result[0]
        res.render('user/place-order', {user, data})
    } catch (err) {
        console.log(err)
    }

})

router.post('/place-order', verifyLoginfetch, async function (req, res) {
    try {
        let data = req.body
        const user = req.session.user;
        const products = await userHelpers.getCartProducts(user._id)
        let totals = await userHelpers.getTotalAmount(user._id)
        totals = totals[0]
        const result=await userHelpers.placeOrder(data, products, totals)
        if(data.paymentMethod==="Cash On Delivery"){
            await userHelpers.changePaymentStatus(data.razorpay_order_id,'Payment Pending')
            res.json({status: true})
        }else {
            const response=await userHelpers.generateRazorpay(result.orderId,result.totalAmount)
            res.json(response)
        }

    } catch (err) {
        console.log(err)
    }
})

router.get('/order-confirmed', verifyLogin, async function (req, res) {
    res.render('user/order-confirmed')
})

router.get('/orders', verifyLogin, async function (req, res) {
    try {
        const user = req.session.user;
        let orderData =await userHelpers.getOrdersData(user._id)
        orderData=await productHelpers.formatCurrency(orderData,'totalAmount')
        const cartCount = await userHelpers.getCartCount(user._id)
        res.render('user/orders',{user,orderData,cartCount})
    } catch (err) {
        console.log(err)
    }
})

router.get('/view-order/:id',verifyLogin, async function (req, res) {
    try {
        const user = req.session.user;
        const orderId = req.params.id;
        let orderDetails=await userHelpers.getOrderDetails(user._id,orderId)
        const cartCount = await userHelpers.getCartCount(user._id)
        res.render('user/view-order',{user,orderDetails,cartCount})

    }catch (err) {
        console.log(err)
    }
})

router.post('/razorpay/callback',async function (req, res) {
    const data = req.body;
    const status=userHelpers.verifyPayment(data)
    if (status){
        await userHelpers.changePaymentStatus(data.razorpay_order_id,'Payment Successful')
        await userHelpers.changeOrderStatus(data.razorpay_order_id)
        res.redirect('/order-confirmed')
    }else {
        res.redirect('/')
    }
})

module.exports = router;
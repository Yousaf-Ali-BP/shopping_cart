const express = require('express');
const router = express.Router();
const productHelpers = require('../helpers/product-helpers')
const userHelpers = require('../helpers/user-helpers')

const verfyLoginfetch = (req, res, next) => {
    if (req.session.loggedIn) {
        next()
    } else {
        res.json({status: false, redirect: '/login'})
    }
}

const verfyLogin = (req, res, next) => {
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
        res.render('user/view-products', {products, user, cartCount});
    })
});

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

router.get('/cart', verfyLogin, async function (req, res) {
    const user = req.session.user;
    let cartCount = null
    if (user) {
        cartCount = await userHelpers.getCartCount(user._id)
    }
    userHelpers.getCartProducts(req.session.user._id).then(products => {
        res.render('user/cart', {products, user, cartCount});
    })

})

router.post('/add-to-cart', verfyLoginfetch, async function (req, res) {
    try {
        let response = await userHelpers.addToCart(req.body.productId, req.session.user._id)
        const cartCount = await userHelpers.getCartCount(req.session.user._id)
        res.json({status: true, cartCount})
    } catch (err) {
        console.log(err)
        res.json({status: false})
    }

})

router.delete('/remove-from-cart', verfyLoginfetch, async function (req, res) {
    try{
        await userHelpers.removeFromCart(req.body.productId, req.session.user._id)
        const cartCount = await userHelpers.getCartCount(req.session.user._id)
        res.json({status: true, cartCount})
    }catch(err){
        console.log(err)
    }

})

router.patch('/increment-cart-quantity', verfyLoginfetch, async function (req, res) {
    try{
        let cartProductCount=await userHelpers.incrementCartQuantity(req.body.productId, req.session.user._id)
        const cartCount = await userHelpers.getCartCount(req.session.user._id)
        res.json({status: true, cartCount,cartProductCount})
    }catch(err){
        console.log(err)
    }

})

router.patch('/decrement-cart-quantity', verfyLoginfetch, async function (req, res) {
    try{
        let cartProductCount = await userHelpers.decrementCartQuantity(req.body.productId, req.session.user._id)
        const cartCount = await userHelpers.getCartCount(req.session.user._id)
        res.json({status: true, cartCount, cartProductCount})
    }catch(err){
        console.log(err)
    }

})

module.exports = router;
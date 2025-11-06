const express = require('express');
const router = express.Router();
const productHelpers = require('../helpers/product-helpers')
const userHelpers = require('../helpers/user-helpers')

const verfyLogin = (req, res, next) => {
    if (req.session.loggedIn) {
        next()
    } else res.redirect('/login')
}

/* GET home page. */
router.get('/',async function (req, res) {
    const user = req.session.user;
    let cartCount=null
    if (user){
        cartCount = await userHelpers.getCartCount(user._id)
    }
    productHelpers.getAllProducts().then(products => {
        res.render('user/view-products', {products, user,cartCount});
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
    let cartCount=null
    if (user){
        cartCount = await userHelpers.getCartCount(user._id)
    }
    userHelpers.getCartProducts(req.session.user._id).then(products => {
        console.log(products);
        res.render('user/cart',{products, user,cartCount});
    })

})

router.get('/add-to-cart/:id', verfyLogin, function (req, res) {
    userHelpers.addToCart(req.params.id,req.session.user._id).then(()=>{
        console.log('cart added')
        res.redirect('/');
    })
})

module.exports = router;
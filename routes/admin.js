const express = require('express');
const router = express.Router();
const productHelpers = require("../helpers/product-helpers");

/* GET users listing. */
router.get('/', function (req, res, next) {
    productHelpers.getAllProducts().then(products => {
        res.render('admin/view-products', {admin: true, products});
    })
});

router.get('/add-product', function (req, res) {
    res.render('admin/add-product',{admin: true});
})

router.post('/add-product', async function (req, res) {
    let image = (req.files.image);
    let result = await productHelpers.addProduct(req.body)
    let imgId = result.insertedId;
    image.mv('./public/product-images/' + imgId + '.webp', (err) => {
        if (!err) {
            res.redirect('/admin');
            console.log('image added');
        } else console.log('error ' + err);
    });
})

router.get('/delete-product/:id', function (req, res) {
    const productId = req.params.id;
    productHelpers.deleteProduct(productId).then(response => {
        res.redirect('/admin');
    })
})

router.get('/edit-product/:id',async function (req, res) {
    const productId = req.params.id;
    let product=await productHelpers.getProductById(productId);
    console.log(product)
    res.render('admin/edit-product',{admin: true,product});
})

router.post('/edit-product/:id',function (req, res) {
    const productId = req.params.id;
    productHelpers.updateProduct(productId, req.body).then(() => {
        res.redirect('/admin');
        if(req.files && req.files.image){
            let image=req.files.image
            image.mv('./public/product-images/' +productId+ '.webp')
        }
    })
})

module.exports = router;

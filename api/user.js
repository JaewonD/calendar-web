var express = require('express');
var router = express.Router();

router.get('/', (req, res) => {
    res.json({success:true, message:"Testing success"});
});

router.get('/test', (req, res) => {
    res.json({success:false, message:"Testing failed?"});
})

module.exports = router;
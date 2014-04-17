var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    req.db.get_recent_builds(10, function(err, builds) {
        if (err) return next(err);
        res.render('index', { builds: builds });
    });
});

module.exports = router;


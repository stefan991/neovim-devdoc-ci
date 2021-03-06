var express = require('express');
var format = require('util').format;
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    req.db.get_recent_builds(req.config.recent_builds, function(err, builds) {
        if (err) return next(err);
        builds.forEach(function(build) {
            build.state_name = req.db.build_state_names[build.state];
            build.build_url = format(req.config.documentation_output_url,
                                     build.id);
            build.log_url = format(req.config.log_output_url, build.id);
        });
        res.render('index', { builds: builds });
    });
});

module.exports = router;


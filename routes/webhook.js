var express = require('express');
var router = express.Router();

router.post('/:secret', function(req, res, next) {
    if (req.params.secret !== req.config.secret) {
        console.log('wrong secret: ' + req.params.secret);
        next(new Error('wrong secret'));
    }
    var event = req.headers['x-github-event'];
    var payload = JSON.parse(req.body.payload);
    if (event === 'push') {
        handle_push(req, res, payload);
    } else {
        console.log('Ignoring event: ' + event);
        res.send('Ignoring event: ' + event);
    }
});

function handle_push(req, res, payload) {
    if (payload.ref !== 'refs/heads/' + req.config.branch) {
        console.log('Ignoring branch: ' + payload.ref);
        res.send('Ignoring branch: ' + payload.ref);
        return;
    }
    if (payload.repository.url !== req.config.repo_url) {
        console.log('Ignoring repo: ' + payload.repository.url);
        res.send('Ignoring repo: ' + payload.repository.url);
        return;
    }
    var head_commit = payload.head_commit;
    var builder = req.builder;
    var db = req.db;
    req.db.create_build(head_commit.id, head_commit, function() {
        res.send('OK.');
        console.log('build created');
        builder.build_next(db, req.config);
    });
}

module.exports = router;


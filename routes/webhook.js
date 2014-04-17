var express = require('express');
var router = express.Router();

router.post('/:secret', function(req, res, next) {
    // TODO: check secret
    var event = req.headers['x-github-event'];
    var payload = JSON.parse(req.body.payload);
    if (event === 'push') {
        handle_push(req, res, payload);
    } else {
        res.send('Ignoring event: ' + event);
    }
});

function handle_push(req, res, payload) {
    // TODO: update
    if (payload.ref !== 'refs/heads/webhook-test') {
        res.send('Ignoring branch: ' + payload.ref);
        return;
    }
    if (payload.repository.url !== 'https://github.com/stefan991/neovim') {
        res.send('Ignoring repo: ' + payload.repository.url);
        return;
    }
    var head_commit = payload.head_commit;
    var builder = req.builder;
    var db = req.db;
    req.db.create_build(head_commit.id, head_commit, function() {
        res.send('OK.');
        builder.build_next(db);
    });
}

module.exports = router;


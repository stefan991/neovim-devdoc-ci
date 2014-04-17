var sqlite = require('sqlite3').verbose();

var BUILD_STATE_NEW = 0;
var BUILD_STATE_STARTED = 1;
var BUILD_STATE_FINISHED = 2;
var BUILD_STATE_ERROR = 3;
var BUILD_STATE_TIMEOUT = 4;

exports.BUILD_STATE_NEW = BUILD_STATE_NEW;
exports.BUILD_STATE_STARTED = BUILD_STATE_STARTED;
exports.BUILD_STATE_FINISHED = BUILD_STATE_FINISHED;
exports.BUILD_STATE_ERROR = BUILD_STATE_ERROR;
exports.BUILD_STATE_TIMEOUT = BUILD_STATE_TIMEOUT;

var db;

function init_db(config) {
    db = new sqlite.Database(config.db_file);
    db.run('CREATE TABLE IF NOT EXISTS builds ('
            + 'id INTEGER PRIMARY KEY AUTOINCREMENT, '
            + 'created_at INTEGER, '
            + 'state INTEGER, '
            + 'git_commit_sha TEXT, '
            + 'data TEXT)');
}

function create_build(git_commit_sha, data, cb) {
    db.run('INSERT INTO builds (created_at, state, git_commit_sha, data) '
            + 'VALUES (?, ?, ?, ?)',
            [new Date(), BUILD_STATE_NEW, git_commit_sha, JSON.stringify(data)],
            cb);
}

function get_next_build(cb) {
    db.get('SELECT id, created_at, state, git_commit_sha, data FROM builds '
            + 'WHERE state = ? ORDER BY created_at ASC LIMIT 1',
            [BUILD_STATE_NEW], function(err, build) {
                if (build) {
                    build.data = JSON.parse(build.data);
                }
                cb(err, build);
            });
}

function update_build_state(build, new_state, cb) {
    db.run('UPDATE builds SET state = ? WHERE id = ?',
            [new_state, build.id], db);
}

function get_recent_builds(count, cb) {
    db.all('SELECT id, created_at, state, git_commit_sha, data FROM builds '
            + 'ORDER BY created_at DESC LIMIT ?', [count],
            function (err, builds) {
                if (builds) {
                    builds.forEach(function(build) {
                      build.data = JSON.parse(build.data);
                    });
                }
                cb(err, builds);
            });
}

exports.init_db = init_db;
exports.create_build = create_build;
exports.get_next_build = get_next_build;
exports.update_build_state = update_build_state;
exports.get_recent_builds= get_recent_builds;


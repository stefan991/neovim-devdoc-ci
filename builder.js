var child_process = require('child_process');
var format = require('util').format;

var is_building = 0;

function build_next(db, config) {
    db.get_next_build(function(err, build) {
        if (err) throw err;
        if (build) {
            execute_build(db, config, build);
        }
    });
}

function execute_build(db, config, build) {
    if (is_building) return; // already building
    is_building = 1;
    db.update_build_state(build, db.BUILD_STATE_STARTED);
    var git_dir = config.git_dir;
    var log_output_file = format(config.log_output_file, build.id);
    var doc_output_dir = format(config.documentation_output_dir, build.id);
    var args = [git_dir, build.data.id, log_output_file, doc_output_dir];
    var process = child_process.spawn('./scripts/build_doc.sh',
        args, { 'stdio': 'ignore' });
    process.on('exit', function(code) {
        if (code) {
            db.update_build_state(build, db.BUILD_STATE_ERROR);
        } else {
            db.update_build_state(build, db.BUILD_STATE_FINISHED);
        }
        is_building = 0;
        build_next(db);
    });
    // TODO: Timeout
}

exports.build_next = build_next;


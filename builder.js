var child_process = require('child_process');

var is_building = 0;

function build_next(db) {
    db.get_next_build(function(err, build) {
        if (err) throw err;
        if (build) {
            execute_build(db, build);
        }
    });
}

function execute_build(db, build) {
    if (is_building) return; // already building
    is_building = 1;
    db.update_build_state(build, db.BUILD_STATE_STARTED);
    var git_dir = '/Users/stefan/Dev/neovim_doc/';
    var log_output_file = '/Users/stefan/Desktop/log.txt';
    var documentation_output_dir = '/Users/stefan/Desktop/docout';
    var process = child_process.spawn('./scripts/build_doc.sh',
        [git_dir, build.data.id, log_output_file, documentation_output_dir],
        { 'stdio': 'ignore' });
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


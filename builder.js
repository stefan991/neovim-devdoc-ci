var child_process = require('child_process');
var exec = require('child_process').exec;
var fs = require('fs');
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

function delete_old_builds(db, config) {
    db.get_builds_to_delete(config.recent_builds, function(err, builds) {
        if (err) throw err;
        builds.forEach(function(build) {
            delete_build(db, config, build);
        });
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
    var timeout;
    var timeout_happend = 0;
    var process = child_process.spawn('./scripts/build_doc.sh',
        args, { 'stdio': 'ignore' });
    process.on('exit', function(code) {
        if (timeout_happend) {
            db.update_build_state(build, db.BUILD_STATE_TIMEOUT);
        } else if (code) {
            db.update_build_state(build, db.BUILD_STATE_ERROR);
        } else {
            db.update_build_state(build, db.BUILD_STATE_FINISHED);
        }
        clearTimeout(timeout);
        is_building = 0;
        update_latest_symlink(db, config);
        build_next(db, config);
        delete_old_builds(db, config);
    });
    function timeout() {
        process.kill('SIGKILL');
        timeout_happend = 1;
    }
    setTimeout(timeout, config.build_timeout * 1000);
}

function update_latest_symlink(db, config) {
    db.get_latest_finished_build(function(err, build) {
        if (err) return;
        var latest_doc_output_dir = format(config.documentation_output_dir,
                                           build.id);
        fs.unlink(config.latest_symlink, function(err) {
            fs.symlink(latest_doc_output_dir,
                       config.latest_symlink,
                       function(err) {});
        });
    });
}

function delete_build(db, config, build) {
    db.update_build_deleted(build, 1);
    var log_output_file = format(config.log_output_file, build.id);
    var doc_output_dir = format(config.documentation_output_dir, build.id);
    fs.unlink(log_output_file, function(err) {
        if (err) {
            console.log('error deleteing log file:', log_output_file, err);
        }
    });
    exec('rm -r ' + doc_output_dir ,function(err, out) {
        if (err) {
            console.log('rm doc_output_dir stdout:', out);
            console.log('rm doc_output_dir stderr:', err);
        }
    });
}

exports.build_next = build_next;
exports.delete_old_builds = delete_old_builds;


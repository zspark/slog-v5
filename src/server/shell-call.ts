const { exec } = require("child_process");
const { GlobalPaths } = require("./basic");
const _CONTENT_PATH_ = GlobalPaths.ROOT_CONTENT;

function _HandleOutput(callback, stdout, error, stderr) {
    if (error) {
        console.log(`error: ${error.message}`);
        callback(false, error.message);
        return;
    }
    if (stderr) {
        console.log(`stderr: ${stderr}`);
        callback(false, stderr);
        return;
    }
    console.log(`stdout: ${stdout}`);
    callback(true, stdout);
}

function GitAdd(callback) {
    const _cmd = `cd ${_CONTENT_PATH_} && git add -A`;
    exec(_cmd, (error, stdout, stderr) => {
        _HandleOutput(callback, stdout, error, stderr);
    });
}
function GitCommit(msg, callback) {
    const _cmd = `cd ${_CONTENT_PATH_} && git commit -m "${msg}"`;
    exec(_cmd, (error, stdout, stderr) => {
        _HandleOutput(callback, stdout, error, stderr);
    });
}

function GitPush(name, branch, callback) {
    const _cmd = `cd ${_CONTENT_PATH_} && git push ${name} ${branch}`;
    exec(_cmd, (error, stdout, stderr) => {
        _HandleOutput(callback, stdout, error, stderr);
    });
}

function GitPull(name, branch, callback) {
    const _cmd = `cd ${_CONTENT_PATH_} && git pull ${name} ${branch}`;
    exec(_cmd, (error, stdout, stderr) => {
        _HandleOutput(callback, stdout, error, stderr);
    });
}

function GitLog(callback) {
    const _cmd = `cd ${_CONTENT_PATH_} && git log --oneline -20`;
    exec(_cmd, (error, stdout, stderr) => {
        _HandleOutput(callback, stdout, error, stderr);
    });
}

/// https://github.com/kpdecker/jsdiff
module.exports = Object.freeze({ GitPush, GitAdd, GitCommit, GitPull, GitLog });

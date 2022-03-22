'use strict';

var fs = require('fs'),
	path = require('path'),
	exists = fs.existsSync || path.existsSync,
	root = path.resolve(__dirname, '..', '..')
	while(root.includes("node_modules")){
		root = path.resolve(root, "../")
	}
	postcommit = path.resolve(root, '.git', 'hooks', 'post-commit');
//
// Bail out if we don't have pre-commit file, it might be removed manually.
//
if (!exists(postcommit)) return;

//
// If we don't have an old file, we should just remove the pre-commit hook. But
// if we do have an old postcommit file we want to restore that.
//
if (!exists(postcommit + '.old')) {
	fs.unlinkSync(postcommit);
} else {
	fs.writeFileSync(postcommit, fs.readFileSync(postcommit + '.old'));
	fs.chmodSync(postcommit, '755');
	fs.unlinkSync(postcommit + '.old');
}

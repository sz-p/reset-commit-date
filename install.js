'use strict';

//
// Compatibility with older node.js as path.exists got moved to `fs`.
//
var fs = require('fs')
  , path = require('path')
  , os = require('os')
  , hook = path.join(__dirname, 'hook')
  , root = path.resolve(__dirname, '..', '..')
  , exists = fs.existsSync || path.existsSync;

  // when use like pnpm __dirname is not linked to root
  while(root.includes("node_modules")){
    root = path.resolve(root, "../")
  }
//
// Gather the location of the possible hidden .git directory, the hooks
// directory which contains all git hooks and the absolute location of the
// `reset-commit-date` file. The path needs to be absolute in order for the symlinking
// to work correctly.
//
var git = path.resolve(root, '.git')
  , hooks = path.resolve(git, 'hooks')
  , postcommit = path.resolve(hooks, 'post-commit');

//
// Bail out if we don't have an `.git` directory as the hooks will not get
// triggered. If we do have directory create a hooks folder if it doesn't exist.
//
if (!exists(git) || !fs.lstatSync(git).isDirectory()){
  console.error('reset-commit-date: The hook was not installed. not find .git/hooks');
  return;
}if (!exists(hooks)) fs.mkdirSync(hooks);

//
// If there's an existing `reset-commit-date` hook we want to back it up instead of
// overriding it and losing it completely as it might contain something
// important.
//
if (exists(postcommit) && !fs.lstatSync(postcommit).isSymbolicLink()) {
  console.log('reset-commit-date:');
  console.log('reset-commit-date: Detected an existing git reset-commit-date hook');
  fs.writeFileSync(postcommit +'.old', fs.readFileSync(postcommit));
  console.log('reset-commit-date: Old reset-commit-date hook backuped to reset-commit-date.old');
  console.log('reset-commit-date:');
}

//
// We cannot create a symlink over an existing file so make sure it's gone and
// finish the installation process.
//
try { fs.unlinkSync(postcommit); }
catch (e) {}

// Create generic postcommit hook that launches this modules hook (as well
// as stashing - unstashing the unstaged changes)
// TODO: we could keep launching the old reset-commit-date scripts
var hookRelativeUnixPath = hook.replace(root, '.');

if(os.platform() === 'win32') {
  hookRelativeUnixPath = hookRelativeUnixPath.replace(/[\\\/]+/g, '/');
}

var postcommitContent = '#!/bin/bash' + os.EOL
  +  hookRelativeUnixPath + os.EOL
  + 'RESULT=$?' + os.EOL
  + '[ $RESULT -ne 0 ] && exit 1' + os.EOL
  + 'exit 0' + os.EOL;

//
// It could be that we do not have rights to this folder which could cause the
// installation of this module to completely fail. We should just output the
// error instead destroying the whole npm install process.
//
try { fs.writeFileSync(postcommit, postcommitContent); }
catch (e) {
  console.error('reset-commit-date:');
  console.error('reset-commit-date: Failed to create the hook file in your .git/hooks folder because:');
  console.error('reset-commit-date: '+ e.message);
  console.error('reset-commit-date: The hook was not installed.');
  console.error('reset-commit-date:');
}

try { fs.chmodSync(postcommit, '777'); }
catch (e) {
  console.error('reset-commit-date:');
  console.error('reset-commit-date: chmod 0777 the reset-commit-date file in your .git/hooks folder because:');
  console.error('reset-commit-date: '+ e.message);
  console.error('reset-commit-date:');
}

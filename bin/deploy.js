#!/usr/bin/env node

const program = require('commander');
const updateNotifier = require('update-notifier');

const pkg = require('../package.json');

updateNotifier({pkg}).notify();

program
  .version(pkg.version)
  .command('deploy', 'deploy the current directory', { isDefault: true })
  .command('list', 'list depoyments').alias('ls')
  .command('register', 'register a user account')
  .command('whoami', 'shows the current logged in user\'s details')
  .command('login', 'login to access deploy and deployment functionality')
  .command('logout', 'logout and invalidate token')
  .command('open [project]', 'open the deployment instance in the browser')
  .command('logs [project]', 'shows the logs for the specificed project')
  .command('delete [project]', 'deletes the deployment instance').alias('rm')
  .command('server', 'starts a server instance locally')
  .parse(process.argv);
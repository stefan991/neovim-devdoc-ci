Neovim developer documentation CI
=================================

This is a simple node.js webapp which builds the doxygen documentation when new commits are added to the master branch of the neovim repo.

Deployment
----------

To start the web server run:

```
> node app.js [config.json]
```

The default configuration file is `./config.json`.

Your `config.json` should look like this (without the comments):

```js
{
    // the github url of the repository
    "repo_url": "https://github.com/neovim/neovim",
    // the branch wich should get built
    "branch": "master",
    // a directory in the filesystem which contains a clone of the repo
    "git_dir": "/home/neovim/neovim-devdoc-ci-data/repo",

    // where to put the log file, %s gets replaced with the build id
    "log_output_file": "/var/www/virtual/neovim/html/devdoc/log/%d.txt",
    // same for the documentation output
    "documentation_output_dir": "/var/www/virtual/neovim/html/devdoc/html/%d",

    // url's that should point to the output directories
    "log_output_url": "/devdoc/log/%d.txt",
    "documentation_output_url": "/devdoc/html/%d/",

    // path to a symlink wich should get updated to the lasted successful build
    "latest_symlink": "/var/www/virtual/neovim/html/devdoc/html/master",
    // the url for that symlink
    "latest_documentation_url": "/devdoc/html/master/",

    // the port for the node.js webapp
    "http_port": 62987,
    // the base url for the webapp, ending with a '/'
    "base_url": "/devdoc/",
    // path to the sqlite3 db file, gets created if it doesn't exist
    "db_file": "/home/neovim/neovim-devdoc-ci-data/builds.db",
    // the secret needed to configure the github webhook
    "secret": "someSecret",
    // time in seconds after wich a build should timeout
    "build_timeout": 300
 }

```

Sample `.htaccess`

```
RewriteEngine On
RewriteRule ^$ http://localhost:62987/$1 [P]
RewriteCond %{REQUEST_FILENAME}       !-f
RewriteCond %{REQUEST_FILENAME}       !-d
RewriteRule ^(.*) http://localhost:62987/$1 [P]
```

Use the following settings to [configure the Github webhook](https://developer.github.com/webhooks/creating/#setting-up-a-webhook)

  * payload url: `base_url + 'webhook/' + secret`
  * payload format: default `(...+form)`
  * events: send me everything


// PM2 production config for the UCC HRMS (admin at /admin, staff portal at /portal).
//
// First time, on your machine (needs SSH access to the server):
//   pm2 deploy ecosystem.config.cjs production setup     # clones the repo on the server
//   scp apps/web/.env.production hrms@SERVER:/var/www/html/hrmsv26/shared/.env
//   pm2 deploy ecosystem.config.cjs production           # build, migrate, start
//
//   Then, once, on the server in /var/www/html/hrmsv26/current:
//     npm run db:seed        # first administrator from SEED_ADMIN_* (skip if hrms_users already has one)
//
// Every release after that:
//   pm2 deploy ecosystem.config.cjs production
//
// On the server:
//   pm2 status | pm2 logs hrms | pm2 reload hrms --update-env
//   pm2 startup && pm2 save                               # start on boot (once)
//   pm2 install pm2-logrotate                             # keep logs bounded (once)
//
// shared/.env must have, at least:
//   DATABASE_URL (the hr database), SESSION_SECRET (new, 32+ chars),
//   APP_URL=https://<domain> (Google sign-in and the circular PDF links sent to staff are built from it),
//   GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET (add {APP_URL}/api/auth/google/callback to the OAuth client),
//   MNOTIFY_API_KEY and/or SMSONLINEGH_API_KEY, SMS_SENDER_ID,
//   GMAIL_USER, GMAIL_APP_PASSWORD, MAIL_FROM_NAME,
//   SCHEDULER_ENABLED=true (daily 07:00 GMT jobs: leave ending, reminders, birthdays; NSS on 1 November),
//   LEGACY_HRMS_URL, LEGACY_PORTAL_URL (where old uploads are served),
//   SEED_ADMIN_NAME / SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD (only for db:seed).
//   DEV_LOGIN and MESSAGING_SIMULATE are forced off below.
//
// nginx in front (HTTPS), proxying to 127.0.0.1:4030:
//   client_max_body_size 12m;            # PDFs and photos are up to 10 MB
//   location / {
//     proxy_pass http://127.0.0.1:4030;
//     proxy_set_header Host $host;
//     proxy_set_header X-Real-IP $remote_addr;
//     proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
//     proxy_set_header X-Forwarded-Proto $scheme;
//     proxy_read_timeout 120s;           # large circular sends and printable reports
//   }
//
// Works with either server layout:
//   a) `pm2 deploy` (below):  /var/www/html/hrmsv26/current = the release,
//                              /var/www/html/hrmsv26/shared  = .env, storage/, logs/
//   b) a plain `git clone` at /var/www/html/hrmsv26: start it there with
//      `pm2 start ecosystem.config.cjs`; storage/ and logs/ go in .shared/
//      (gitignored) and .env stays in apps/web/.env.
const fs = require('node:fs')
const path = require('node:path')
const { parseEnv } = require('node:util')

const ROOT = '/var/www/html/hrmsv26'
const APP_DIR = path.join(__dirname, 'apps/web')
// pm2 deploy checks the repo out to <ROOT>/source and links <ROOT>/current to it.
const IS_RELEASE = ['current', 'source'].includes(path.basename(__dirname))
const SHARED = IS_RELEASE ? path.join(__dirname, '..', 'shared') : path.join(__dirname, '.shared')

// PM2 won't start the app if its log folder is missing.
for (const dir of [`${SHARED}/logs`, `${SHARED}/storage`]) {
  try {
    fs.mkdirSync(dir, { recursive: true })
  } catch {
    // Not on the server (or no permission): PM2 reports it if it matters.
  }
}

// Nitro's production server doesn't read .env itself, so load it here. This
// works the same in fork and cluster mode. After editing .env on the server,
// run `pm2 reload hrms --update-env`.
function readEnv(file) {
  try {
    return parseEnv(fs.readFileSync(file, 'utf8'))
  } catch {
    return {}
  }
}

module.exports = {
  apps: [
    {
      name: 'hrms',
      cwd: APP_DIR,
      script: '.output/server/index.mjs',

      // Two workers share the port: `pm2 reload` restarts them one at a time,
      // so deploys have no downtime. Only worker 0 runs the scheduled jobs
      // (see startScheduler), and every message is deduplicated in the
      // database, so nothing is sent twice.
      exec_mode: 'cluster',
      instances: 2,

      env: {
        ...readEnv(path.join(APP_DIR, '.env')),
        NODE_ENV: 'production',
        HOST: '127.0.0.1', // nginx faces the internet
        PORT: '4030',
        // Outside the release folder, so staff documents, circular PDFs,
        // photos and portal uploads survive every deploy.
        STORAGE_DIR: `${SHARED}/storage`,
        // Never in production: development sign-in and simulated SMS/email.
        DEV_LOGIN: 'false',
        MESSAGING_SIMULATE: 'false',
      },

      max_memory_restart: '1G',
      kill_timeout: 15_000, // let in-flight requests (uploads, a circular batch) finish
      listen_timeout: 15_000,
      exp_backoff_restart_delay: 200, // back off instead of crash-looping (e.g. DB down)
      max_restarts: 20,

      out_file: `${SHARED}/logs/hrms.out.log`,
      error_file: `${SHARED}/logs/hrms.error.log`,
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      time: false,
    },
  ],

  deploy: {
    production: {
      user: 'hrms', // the account the app runs as; it owns /var/www/html/hrmsv26
      host: ['YOUR_SERVER_IP'],
      ref: 'origin/master',
      repo: 'https://github.com/dexitional/hrmsv26.git', // use git@github.com:… if the repo is private
      path: ROOT,
      ssh_options: 'StrictHostKeyChecking=accept-new',

      'pre-setup': `mkdir -p ${ROOT}/shared/storage ${ROOT}/shared/logs`,

      // Runs in /var/www/html/hrmsv26/current after each pull.
      'post-deploy': [
        // The app and the database scripts (migrate, seed) both read the shared .env.
        `ln -sfn ${ROOT}/shared/.env apps/web/.env`,
        `ln -sfn ${ROOT}/shared/.env packages/db/.env`,
        'npm ci --include=dev', // the build needs Vite and the other devDependencies
        `set -a && . ${ROOT}/shared/.env && set +a`,
        `export STORAGE_DIR=${ROOT}/shared/storage`,
        'npm run build',
        // Additive migrations on the live hr database; back it up before big releases.
        'npm run db:migrate',
        'pm2 reload ecosystem.config.cjs --update-env',
        'pm2 save',
      ].join(' && '),
    },
  },
}

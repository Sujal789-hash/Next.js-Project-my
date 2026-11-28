# One-time production admin bootstrap

There is intentionally **no public registration path and no HTTP endpoint** for creating an admin.
The first admin is created from a terminal with `scripts/bootstrap-admin.js`.

The script:

- Requires an explicit opt-in and an exact confirmation of the target database name.
- Uses the real `models/User.js` Mongoose model and the existing `lib/password.js` bcrypt helper.
- Refuses to run if an admin already exists, or if the chosen email already belongs to a user.
- Only inserts a new document (`$setOnInsert`); it never deletes, drops, or modifies existing records.
- Never prints the connection URI or the password.

## Required environment variables

| Variable | Purpose |
|---|---|
| `MONGODB_URI` | Atlas connection string **with an explicit database name**. |
| `ADMIN_BOOTSTRAP` | Must be exactly `1`. Opt-in confirmation. |
| `ADMIN_BOOTSTRAP_CONFIRM_DB` | Must exactly equal the database name inside `MONGODB_URI`. |
| `ADMIN_BOOTSTRAP_FULL_NAME` | Admin's full name (2–60 characters). |
| `ADMIN_BOOTSTRAP_EMAIL` | Admin's email address. |
| `ADMIN_BOOTSTRAP_PASSWORD` | At least 12 characters, containing a letter and a number. |

Optional:

| Variable | Purpose |
|---|---|
| `ADMIN_BOOTSTRAP_PHONE` | Phone number (max 20 characters). |
| `ADMIN_BOOTSTRAP_DRY_RUN` | Set to `1` to validate everything and print the target DB without writing. |

Never commit these values. Supply them only in the shell session (or your secret manager) that runs the command.

## Exact command

Set the variables in your own shell, then run the script. Replace the bracketed placeholders; do not paste real secrets into documentation or source control.

### PowerShell

```powershell
$env:MONGODB_URI = "<your-atlas-uri-with-database-name>"
$env:ADMIN_BOOTSTRAP = "1"
$env:ADMIN_BOOTSTRAP_CONFIRM_DB = "<exact-database-name>"
$env:ADMIN_BOOTSTRAP_FULL_NAME = "<admin-full-name>"
$env:ADMIN_BOOTSTRAP_EMAIL = "<admin-email>"
$env:ADMIN_BOOTSTRAP_PASSWORD = "<strong-password>"

npm run bootstrap:admin
```

### macOS / Linux

```bash
export MONGODB_URI='<your-atlas-uri-with-database-name>'
export ADMIN_BOOTSTRAP=1
export ADMIN_BOOTSTRAP_CONFIRM_DB='<exact-database-name>'
export ADMIN_BOOTSTRAP_FULL_NAME='<admin-full-name>'
export ADMIN_BOOTSTRAP_EMAIL='<admin-email>'
export ADMIN_BOOTSTRAP_PASSWORD='<strong-password>'

npm run bootstrap:admin
```

To preview first, also set `ADMIN_BOOTSTRAP_DRY_RUN=1` and run the same command.

## After bootstrap

Sign in through the existing application login page with the bootstrap email and password. The existing authentication route issues the JWT cookie as usual — the script does not create or print tokens.

If the script reports that an admin already exists, stop: no further action is needed.

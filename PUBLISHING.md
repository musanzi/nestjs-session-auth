# Publishing `nestjs-session-auth` to npm

## Pre-flight checklist

- [ ] Create an npm account at https://www.npmjs.com/signup (or log in)
- [ ] Run `npm login` in the terminal and authenticate
- [ ] Make sure the package name `nestjs-session-auth` is available:
      `npm view nestjs-session-auth` — if it returns a 404, you're good

## Steps

```bash
cd ~/Documents/projects/nestjs-session-auth

# 1. Make sure the build is fresh
npm run build

# 2. Preview exactly what will be published
npm pack --dry-run

# 3. Publish
npm publish --access public
```

## Versioning (for future releases)

```bash
# Patch fix (1.0.0 → 1.0.1)
npm version patch && npm publish --access public

# Minor feature (1.0.0 → 1.1.0)
npm version minor && npm publish --access public

# Breaking change (1.0.0 → 2.0.0)
npm version major && npm publish --access public
```

## Set up a GitHub repo (recommended before publishing)

```bash
cd ~/Documents/projects/nestjs-session-auth
git init
git add .
git commit -m "feat: initial release of nestjs-session-auth"
gh repo create wmusanzi/nestjs-session-auth --public --push --source=.
```

Then update `package.json` → `repository.url` with the real URL.

## Optional: set up CI with GitHub Actions

Create `.github/workflows/publish.yml` to auto-publish on git tags.

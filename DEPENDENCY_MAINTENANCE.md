# Eric's Keep - Dependency Maintenance Guide

## ✅ Current Status
- **No deprecation warnings** as of last check
- **0 security vulnerabilities**
- **All packages up to date**

## 🛠️ Maintenance Commands

### Quick Health Check
```bash
npm run maintenance
```

### Manual Checks
```bash
# Check for outdated packages
npm outdated

# Security audit
npm audit

# Check all dependencies
npm ls --all
```

## 📋 Proactive Measures Implemented

### 1. Override Configuration
Added to `package.json` to prevent common deprecation issues:
- `glob: ^10.0.0` (replaces deprecated v7.x)
- `rimraf: ^5.0.0` (replaces deprecated v3.x)
- `inflight: lru-cache` (replaces deprecated inflight package)
- Babel plugin replacements for modern standards

### 2. NPM Configuration
Created `.npmrc` with best practices:
- Disables optional dependencies to reduce attack surface
- Ensures package-lock.json is always updated
- Uses exact versions for reproducibility

### 3. Maintenance Script
Created `maintenance.mjs` for automated health checks:
- Checks for outdated packages
- Security audit
- General health verification

## 🔄 Regular Maintenance Schedule

### Weekly
- Run `npm run maintenance`
- Check for new updates

### Monthly
- Update minor/patch versions
- Review security advisories

### Quarterly
- Major version updates (with testing)
- Review and update override configurations

## 🚨 Warning Signs to Watch For

1. **Deprecation warnings** during `npm install`
2. **Security vulnerabilities** in `npm audit`
3. **Build warnings** from Vite/ESLint
4. **Runtime errors** after updates

## 🆘 Troubleshooting

### If Deprecation Warnings Appear
1. Identify the specific package
2. Check if it's a direct or transitive dependency
3. Update the override configuration in `package.json`
4. Test thoroughly after updates

### If Build Breaks After Updates
1. Check Vite and ESLint compatibility
2. Review React version compatibility
3. Test Three.js/react-three-fiber combinations

### Emergency Rollback
```bash
# Restore from package-lock.json
rm -rf node_modules package-lock.json
npm install
```

## 📞 Support
For complex dependency issues:
1. Check the [npm security advisories](https://github.com/advisories)
2. Review [Vite migration guides](https://vitejs.dev/guide/migration.html)
3. Test updates in a separate branch first
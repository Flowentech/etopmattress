# Git History Sanitization Guide

## ⚠️ CRITICAL SECURITY WARNING

Your repository contains exposed API keys and secrets in the git history. Follow these steps immediately to clean up the repository.

## Immediate Actions Required

### 1. Rotate All Exposed Keys

**Rotate these keys IMMEDIATELY:**

1. **Sanity Tokens**
   - Go to https://www.sanity.io/manage
   - Regenerate both read and write tokens
   - Update environment variables

2. **Clerk Keys**
   - Go to https://dashboard.clerk.com
   - Regenerate publishable and secret keys
   - Update all environment variables
   - Reconfigure Clerk in your application

3. **Stripe Keys**
   - Go to https://dashboard.stripe.com/apikeys
   - Regenerate all keys
   - Update webhook endpoints
   - Reconfigure Stripe integration

4. **Hashnode Token**
   - Go to your Hashnode dashboard
   - Generate new access token
   - Update environment variables

### 2. Clean Git History

Run these commands to remove the exposed secrets from git history:

```bash
# Install BFG Repo-Cleaner (alternative to git filter-branch)
# Download from: https://rtyley.github.io/bfg-repo-cleaner/

# Or use git filter-branch (built-in)
git filter-branch --force --index-filter \
  'git rm --cached --ignore-unmatch .env.example' \
  --prune-empty --tag-name-filter cat -- --all

# Remove sensitive files from all history
git filter-branch --force --index-filter \
  'git rm --cached --ignore-unmatch .env.production .env.production.example docs/DEPLOYMENT.md docs/DEVELOPER.md docs/API.md' \
  --prune-empty --tag-name-filter cat -- --all

# Create a new orphan branch with clean history
git checkout --orphan clean-main
git add -A
git commit -m "Initial clean commit - secrets removed"

# Delete old branch and rename clean branch
git branch -D main
git branch -m main
git push -f origin main
```

### 3. Repository Protection

After cleaning:

```bash
# Add .gitignore rules to prevent future exposure
echo ".env.local
.env.production
.env.staging
*.key
*.pem
secrets/
private/" >> .gitignore

# Set up branch protection rules on GitHub
# - Require PR reviews
# - Require status checks to pass
# - Restrict force pushes
```

### 4. Team Notification

Notify all team members:
- Keys have been rotated
- Update local environments
- Never commit secrets
- Use environment variables

### 5. Monitoring

Monitor for suspicious activity:
- Stripe transactions
- Sanity API usage
- Clerk authentication logs
- Unusual API calls

## Alternative: Use git-filter-repo

For more thorough cleaning:

```bash
# Install git-filter-repo
pip3 install git-filter-repo

# Remove specific patterns
git-filter-repo --replace-text <(echo "
sanity_write_token==>REDACTED
sanity_api_read_token==>REDACTED
clerk_secret_key==>REDACTED
stripe_secret_key==>REDACTED
hashnode_access_token==>REDACTED
")

# Remove entire files
git-filter-repo --path .env.example --invert-paths
```

## Verification

After cleaning:

```bash
# Search for remaining secrets
git log --all --full-history -- "*env*"
git log --all --full-history --grep="sk_test"
git log --all --full-history --grep="skyi8yDyLiOYndc46DDqaIpdyz"

# Check .env.example is clean
git show HEAD:.env.example
```

## Future Prevention

1. **Pre-commit hooks**
   ```bash
   # Install pre-commit
   pip install pre-commit

   # Add to .pre-commit-config.yaml
   repos:
     - repo: https://github.com/Yelp/detect-secrets
       rev: v1.4.0
       hooks:
         - id: detect-secrets
   ```

2. **Git hooks**
   ```bash
   # Add to .git/hooks/pre-commit
   #!/bin/sh
   if git diff --cached --name-only | xargs grep -l "sk_test\|skyi8yDyLiOYndc46"; then
     echo "WARNING: Potential secrets detected!"
     exit 1
   fi
   ```

3. **Environment management**
   - Use `.env.example` with placeholder values only
   - Never commit real secrets
   - Use secret management services in production

## Emergency Contacts

If you detect suspicious activity:
- **Stripe**: Contact support immediately
- **Clerk**: Review authentication logs
- **Sanity**: Check API access logs
- **Legal/Security team**: Report potential data breach

---

**IMPORTANT**: This is a security incident. Follow your company's incident response protocol and document all actions taken.
# GitHub Actions Deployment Setup for Afyagate.com

## Overview
This guide will help you set up automatic deployment to your server at `3.230.72.136` whenever you push changes to the main branch.

## Prerequisites
- GitHub repository with your code
- Server access (already configured)
- SSH key for server access

## Step 1: Add SSH Private Key to GitHub Secrets

1. Go to your GitHub repository
2. Click on **Settings** tab
3. In the left sidebar, click **Secrets and variables** → **Actions**
4. Click **New repository secret**
5. Set the following:
   - **Name**: `SSH_PRIVATE_KEY`
   - **Secret**: Copy and paste the entire SSH private key below:

```
-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEAxy+dfz+thaV7CXsh/kEgaKwODU7uda1Y3zVYmCU24gpR6pj1
ZVRe1jXzHMhS/C+6aIX8zZt9ASADcc67FA74rG+sslWDv0ZSFLBHOh2+q0dDag2u
iL5jLRgFkY43uItDK5DoBxut7swixKUwVxZsh7fjilEACtINfGUR59/Hp/JX3pKW
HD28llkoW6t7JyE5G3DhOVcHvvGIhpOJmpK/yy1CV4hoFw9jzOlxSBlODllhDRFc
aKbh0N4XXRY5vvvdx8xaugBhtAMKMN5kt61ptLD8xuw9MeKhmc4DPHvONkiGZcim
DiXszTzvOh4qPTrxN/lXaZs3FBuDXrafKpHJTwIDAQABAoIBAQCpKS0O5puNhw5I
7QPflJvbiVOdxc0Kr59sYTfObrx/l9gd7q1p0w9/yO2hIhgoCLi9EB202Dp/fBqw
yqtiy5wxhd4azjlHdoc6/sJe/ufxOmJsbRYvF9HOeDoydZ+o4My48SW886rxxPg6
HThCnc6qLGfYDhaFGgNOA+ADFq/PVqZL5gERpRXgcnV/bBOwSQLxGxiV+q0nLqFQ
VJlqbza0khcMsJWgmxm5VX61zppBsLzetREFwM6SMRBf0cyxyn9aKw0o91qLwEYR
S7Jb/ebRv//MI/ikb8VxlTO8M1BZRLtfGiLfLJ8GxtkkwSRO7sa0kpibVvR97T+3
v3K7aajRAoGBAPes5fAzLrVA0roHsVQvur0rDgptxAop4LJmiqDhzXXycTBWcD/R
O7vTtn5iFANvae2m7CsHHqeZFTYShux4jcQqJt7W3CGjczHrRp9RNPAAuKtVS0BR
VT7JajNa6iaF+Ei1DrAfmQVPVqLuPZEmqn6OuE56kFzNkn1J0kWJsFslAoGBAM3h
foUI3kak3YJh6mhVRfW71PIAQq2BXMgJeE+BzbNJdxanyFhSs7vlhESimqWSA+zd
mrGFEZ0Q8FdgDp+UrkkijWBYY+HaLr/zmlkxhQ5TAiURKzfXUuFzcJoRy3DcGubq
pVPNTrMPX64ATlG4v1r+ubrjsVshr2Kn+FQFs0JjAoGBAPemIDyvUNLXwF1W988P
8o7YEDAJVW48NXrs4UzAu2pmQxtsMsz879d9eAqjExPkQWzp7VeQxOwcO4NXvyWP
3WD6LOfAu1e/UZ3mfTUsQ9x/PCfFH3tuV+hyCQjUrTBb4MkCkW82CRGwJRbBVTpg
CTaGim+eSd8hhopUWDZD2N0pAoGAU80ZZqU5dJ/e2hdpBpbPJzsRbn/UpDMnxPS1
2AcJ55RbuQkKb4kaR70gnZ9iO0q39k4tjVyQ0tH2QlqDGUm3t2UtDq5r2Z6psNBD
X1LcyfvXv6bBZLVssv/+MXhUyteMy7lvGjFTe2cilvzg5DrDCRLuHrhXlLSdYxbj
6a94S+kCgYBiH251ovjTaUdrc8zu/wB28UKBn1Q6HpWbhQLPQsCcSNcNJVS7skeA
IrIWqbmCfYJS+maRNn9tizC6ql062kztRF62eJHtqUFYye07q2YZBLPfGebhhHfi
sA78a7jeckbkvObskCwa/ZgTLbGQ+HeCrAtOrlvd3AMb/wAnDAkVhg==
-----END RSA PRIVATE KEY-----
```

6. Click **Add secret**

## Step 2: Workflow Configuration

The workflow file `.github/workflows/deploy-afyagate.yml` has been created with the following features:

### Features:
- ✅ **Automatic deployment** on push to main branch
- ✅ **Manual deployment** via GitHub Actions UI
- ✅ **Testing** before deployment (linting, tests)
- ✅ **Backup creation** before each deployment
- ✅ **Rollback capability** if deployment fails
- ✅ **Health checks** after deployment
- ✅ **Cleanup** of old backups (keeps 5 most recent)

### Deployment Process:
1. **Test**: Runs linting and tests
2. **Build**: Creates production build
3. **Backup**: Creates backup of current deployment
4. **Deploy**: Uploads and extracts new version
5. **Health Check**: Verifies deployment is working
6. **Cleanup**: Removes old backups and temporary files

## Step 3: Test the Deployment

### Option 1: Automatic Deployment
1. Make a small change to your code
2. Commit and push to the main branch:
   ```bash
   git add .
   git commit -m "Test deployment"
   git push origin main
   ```

### Option 2: Manual Deployment
1. Go to your GitHub repository
2. Click on **Actions** tab
3. Select **Deploy to Afyagate.com** workflow
4. Click **Run workflow**
5. Select the branch and click **Run workflow**

## Step 4: Monitor Deployment

1. Go to **Actions** tab in your GitHub repository
2. Click on the running workflow to see real-time logs
3. Check the deployment status and any error messages

## Troubleshooting

### Common Issues:

1. **SSH Key Issues**:
   - Ensure the SSH private key is correctly copied (including the BEGIN/END lines)
   - Verify the key has proper permissions

2. **Server Connection Issues**:
   - Check that the server IP is correct: `3.230.72.136`
   - Verify the server is accessible from GitHub Actions

3. **Deployment Failures**:
   - Check the workflow logs for specific error messages
   - Verify nginx configuration is valid
   - Ensure proper file permissions

### Rollback:
If a deployment fails, the workflow will automatically attempt to rollback to the previous version.

## Security Notes

- The SSH private key is stored securely in GitHub Secrets
- The key is only used during deployment and is cleaned up after each run
- Backups are created before each deployment for safety

## Next Steps

Once you've added the SSH key to GitHub Secrets:
1. Push your changes to trigger the first deployment
2. Monitor the Actions tab to ensure everything works
3. Your site will be automatically updated at `https://afyagate.com` whenever you push changes!

## Support

If you encounter any issues:
1. Check the GitHub Actions logs
2. Verify the server is accessible
3. Ensure all secrets are properly configured

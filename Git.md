# Git Setup and Push Instructions

## Repository URL
```
https://github.com/kaunda-a/nyx-automation.git
```

## Initial Setup

1. **Clone the repository** (if you haven't already):
   ```bash
   git clone https://github.com/kaunda-a/nyx-automation.git
   cd nyx-automation
   ```

2. **If you already have the code locally**, initialize git:
   ```bash
   git init
   ```

## Pushing Changes

1. **Add all files to git**:
   ```bash
   git add .
   ```

2. **Commit your changes**:
   ```bash
   git commit -m "Your commit message here"
   ```

3. **Add the remote origin** (if you initialized locally):
   ```bash
   git remote add origin https://github.com/kaunda-a/nyx-automation.git
   ```

4. **Rename the branch to main** (if needed):
   ```bash
   git branch -M main
   ```

5. **Push to the remote repository**:
   ```bash
   git push -u origin main
   ```

## For Subsequent Changes

1. **Add changed files**:
   ```bash
   git add .
   ```

2. **Commit changes**:
   ```bash
   git commit -m "Description of changes"
   ```

3. **Push changes**:
   ```bash
   git push
   ```

## Troubleshooting

- If you get authentication errors, you might need to set up SSH keys or use a personal access token.
- If you have conflicts when pushing, you may need to pull changes first:
  ```bash
  git pull origin main
  ```

## Important Notes

- Make sure you never commit sensitive information like passwords or API keys.
- The `.gitignore` file is already configured to prevent `node_modules` and other unnecessary files from being committed.
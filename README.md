# Canasta Scorekeeper Pro

A full-featured Canasta scorekeeping application with customizable house rules, detailed meld and Canasta tracking, and multi-game session management.

## Deployment Options

### 1. Deploying to GitHub Pages (Automated Workflow)

This repository includes a pre-configured GitHub Actions workflow in `.github/workflows/deploy.yml`.

1. **Push code to GitHub**: Export or push this repository to GitHub on the `main` branch.
2. **Enable Pages in GitHub Settings**:
   - Go to your repository on GitHub -> **Settings** -> **Pages**.
   - Under **Build and deployment** -> **Source**, select **GitHub Actions**.
3. **Automatic Build & Deploy**: Every push to the `main` branch will automatically build the app and deploy it to `https://<your-username>.github.io/<repository-name>/`.

---

### 2. Deploying to Posit Connect / Posit Connect Cloud

Since this is a client-side Single Page Application (SPA), Posit Connect can host it as a **Static Web Site**.

#### Method A: Using Posit Connect Cloud (GUI Upload)
1. Build the production static assets locally:
   ```bash
   npm run build
   ```
   This creates a `dist/` directory containing all compiled HTML, JS, and CSS assets.
2. Log in to [Posit Connect Cloud](https://connect.posit.cloud/).
3. Click **Publish** -> **Static Content** (or **Web Application**).
4. Select or drag-and-drop the contents of the `dist/` folder.
5. Set your access permissions and click **Publish**.

#### Method B: Using `rsconnect` CLI
You can deploy directly from your command line using Python's `rsconnect-python` tool:
1. Install `rsconnect-python`:
   ```bash
   pip install rsconnect-python
   ```
2. Build the project:
   ```bash
   npm run build
   ```
3. Deploy the `dist` directory:
   ```bash
   rsconnect deploy html --server https://your-connect-server.com --api-key YOUR_API_KEY dist/ --title "Canasta Scorekeeper Pro"
   ```

---

## Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```


# Deploy Manual para GitHub Pages

Se você quiser fazer o deploy manualmente sem GitHub Actions:

## Passos:

1. **Build local do projeto:**
   ```bash
   npm run build
   ```

2. **A pasta `dist` será criada com os arquivos de produção**

3. **No GitHub:**
   - Vá em Settings → Pages
   - Source: "Deploy from a branch"
   - Branch: selecione `gh-pages` (será criado automaticamente)
   - Folder: `/ (root)`

4. **Para fazer deploy manual:**
   - Copie todo o conteúdo da pasta `dist`
   - Crie/atualize o branch `gh-pages`
   - Faça commit dos arquivos da `dist` neste branch

## Alternativa mais fácil:
Use o sistema de publicação do próprio Lovable clicando em "Publish" no editor.

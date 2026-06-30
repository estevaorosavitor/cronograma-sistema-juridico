FROM nginx:1.27-alpine

# Configuração do Nginx (gzip, cache e headers de segurança)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Arquivos do site (APENAS os públicos — admin.html fica de fora de propósito,
# para o cliente só conseguir visualizar). Veja o README para hospedar o admin com senha.
COPY index.html style.css cronograma.js data.json logo-icon.svg favicon.ico favicon.png apple-touch-icon.png /usr/share/nginx/html/

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost/ >/dev/null 2>&1 || exit 1

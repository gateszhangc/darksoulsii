FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

COPY index.html ./index.html
COPY bosses.html ./bosses.html
COPY areas.html ./areas.html
COPY builds.html ./builds.html
COPY faq.html ./faq.html
COPY assets ./assets
COPY robots.txt ./robots.txt
COPY script.js ./script.js
COPY server.js ./server.js
COPY site.webmanifest ./site.webmanifest
COPY sitemap.xml ./sitemap.xml
COPY styles.css ./styles.css

EXPOSE 3000

CMD ["node", "server.js"]

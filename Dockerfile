# -------- Stage 1 - Develop Container
FROM node:20 AS develop
VOLUME ["/usr/src/app"]
RUN apt-get update && \
    apt-get install -y \
        chromium

# -------- Stage 2 - Build Container
FROM develop AS builder
COPY ./ /build/
WORKDIR /build
RUN rm -rf node_modules package-lock.json
RUN npm install
RUN npm run build
RUN npm test

WORKDIR /build/demopage
RUN rm -rf node_modules package-lock.json
RUN npm install
RUN npm run build


# -------- Stage 3 - Demopage serve container
FROM httpd:2.4
COPY --from=builder /build/demopage/dist/ /usr/local/apache2/htdocs/
FROM node:14
WORKDIR /app
ENV NODE_ENV=production
COPY . .
RUN yarn
CMD node index.js
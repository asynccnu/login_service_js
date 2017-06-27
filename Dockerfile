FROM daocloud.io/library/node:latest
MAINTAINER muxistudio <muxistudio@qq.com>

ENV DEPLOY_PATH /login_api
RUN mkdir -p $DEPLOY_PATH
WORKDIR $DEPLOY_PATH
Add package.json package.json
RUN npm install --registry=https://registry.npm.taobao.org
Add . .

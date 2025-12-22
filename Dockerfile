FROM ubuntu

RUN apt-get update && apt-get install -y curl

RUN curl -sL https://deb.nodesource.com/setup_16.x -o /tmp/nodesource_setup.sh \
    && bash /tmp/nodesource_setup.sh \
    && apt-get install -y nodejs

RUN node -v
RUN npm -v

WORKDIR /backend

COPY Backend/package*.json ./

RUN npm install

COPY Backend ./  
CMD ["npm", "start"]

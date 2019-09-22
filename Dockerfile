FROM ubuntu:18.04

ENV USER root

# install requirements
RUN apt-get update                              && \
    apt-get install -y build-essential          && \
    apt-get install -y git                      && \
    apt-get install -y curl                     && \
    apt-get install -y libxkbfile-dev           && \
    apt-get install -y libsecret-1-dev          && \
    apt-get install -y dumb-init                && \
    apt-get install -y nginx                    && \
    apt-get install -y nano

# install node
RUN curl -sL https://deb.nodesource.com/setup_10.x | bash - && \
    apt-get install -y nodejs

# install yarn
RUN npm install -g yarn@1.13

# install express
RUN npm install -g express-generator && \
    npm install express

# install gulp
RUN npm install gulp-cli -g

# install nodemon
RUN npm install nodemon -g

# download vscode and code-server
RUN git clone https://github.com/microsoft/vscode                       && \
    cd vscode                                                           && \
    git checkout 1.38.1                                                 && \
    git clone https://github.com/neon-counsel/code-server src/vs/server

# setup the build location
RUN mkdir /codeserver
ENV OUT /codeserver

# patch vscode and install dependencies
RUN cd /vscode/src/vs/server                && \
    yarn patch:apply                        && \
    yarn                                    

# compile vscode
RUN cd /vscode                              && \
    gulp compile --max_old_space_size=4095  && \
    cd /vscode/src/vs/server                && \
    ./scripts/tasks.bash build 1.38.1 development

# setup the dev volume
VOLUME /site
WORKDIR /site

# expose the http port
EXPOSE 80

# initialize the container
ENTRYPOINT ["dumb-init", "--"]

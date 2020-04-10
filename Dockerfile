FROM debian:10

# install requirements
RUN apt-get update                              && \
    apt-get install -y build-essential          && \
    apt-get install -y git                      && \
    apt-get install -y curl                     && \
    apt-get install -y libxkbfile-dev           && \
    apt-get install -y libsecret-1-dev          && \
    apt-get install -y dumb-init                && \
    apt-get install -y nginx                    && \
    apt-get install -y nano                     && \
    apt-get install -y sudo                     && \
    apt-get install -y wget                     && \
    apt-get install -y man

RUN chsh -s /bin/bash
ENV SHELL=/bin/bash

# install node
RUN curl -sL https://deb.nodesource.com/setup_10.x | bash - && \
    apt-get install -y nodejs

# install nodemon
RUN npm install nodemon -g

RUN adduser --gecos '' --disabled-password coder && \
  echo "coder ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers.d/nopasswd

RUN curl -SsL https://github.com/boxboat/fixuid/releases/download/v0.4/fixuid-0.4-linux-amd64.tar.gz | tar -C /usr/local/bin -xzf - && \
    chown root:root /usr/local/bin/fixuid && \
    chmod 4755 /usr/local/bin/fixuid && \
    mkdir -p /etc/fixuid && \
    printf "user: coder\ngroup: coder\n" > /etc/fixuid/config.yml

RUN cd /tmp && wget https://github.com/cdr/code-server/releases/download/3.1.0/code-server-3.1.0-linux-x86_64.tar.gz
RUN cd /tmp && tar -xzf code-server*.tar.gz && rm code-server*.tar.gz && \
  mv code-server* /usr/local/lib/code-server && \
  ln -s /usr/local/lib/code-server/code-server /usr/local/bin/code-server

# setup the dev volume
VOLUME /code
WORKDIR /code

# expose the http port
EXPOSE 80
EXPOSE 8080
USER coder

# initialize the container
ENTRYPOINT ["dumb-init", "fixuid", "-q", "/usr/local/bin/code-server", "--auth", "none", "--host", "0.0.0.0", "."]
 
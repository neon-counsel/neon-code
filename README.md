# neon-code

## Requirements
_______________
* Git
* Docker

## Setup
________
1. Download the container

        docker pull neoncounsel/neon-code

2. Clone the repository

        git clone https://github.com/neon-counsel/neon-code

3. Navigate to repository folder

        cd neon-code

4. Run the container

    On unix

        docker run -it -v ${PWD}:/site -p 127.0.0.1:8080:80 neoncounsel/neon-code /bin/bash

    On Windows

        docker run -it -v %cd%:/site -p 127.0.0.1:8080:80 neoncounsel/neon-code /bin/bash

5. Setup nginx, install dependencies and start the server

        ./init.sh
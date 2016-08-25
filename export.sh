#!/bin/bash

git filter-branch --env-filter '
    if [ 1 ]; then \
        export GIT_AUTHOR_NAME="Jon Doe" GIT_AUTHOR_EMAIL="john@bugmenot.com" GIT_COMMITTER_NAME="Jon Doe" GIT_COMMITTER_EMAIL="john@bugmenot.com"; \
    fi
    ' -f;

git push ext export

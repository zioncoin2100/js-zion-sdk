#!/bin/bash

cd ../../
if [ "$TRAVIS" ]; then
  git clone "https://zion-jenkins@github.com/zion/js-zion-lib.git" js-zion-lib-gh-pages
else
  git clone git@github.com:zion/js-zion-lib.git js-zion-lib-gh-pages
fi
cd js-zion-lib-gh-pages
git checkout origin/gh-pages
git checkout -b gh-pages
git branch --set-upstream-to=origin/gh-pages
cd ../js-zion-lib/website

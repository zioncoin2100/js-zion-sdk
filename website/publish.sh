#!/bin/bash

set -e

cd ../../js-zion-lib-gh-pages
git checkout -- .
git clean -dfx
git fetch
git rebase
rm -Rf *
cd ../js-zion-lib/website
npm run-script docs
cp -R docs/* ../../js-zion-lib-gh-pages/
rm -Rf docs/
cd ../../js-zion-lib-gh-pages
git add --all
git commit -m "update website"
git push
cd ../js-zion-lib/website
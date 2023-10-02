#!/bin/bash
[ ! -d ./out/make/rpm/x64/ ] && mkdir -p ./out/make/rpm/x64
cp ./out/make/deb/x64/pveclient_1.0.0_amd64.deb ./out/make/rpm/x64/
cd ./out/make/rpm/x64/
alien -r pveclient_1.0.0_amd64.deb
/bin/rm pveclient_1.0.0_amd64.deb
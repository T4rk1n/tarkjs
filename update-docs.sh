#!/usr/bin/env bash

git='git@github.com:T4rk1n/tarkjs.git'

curl 'https://doc.esdoc.org/api/create' -X POST --data-urlencode "gitUrl=$git"

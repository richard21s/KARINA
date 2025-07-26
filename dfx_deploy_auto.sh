#!/usr/bin/expect -f

set timeout -1
set passphrase "allforone01121241"

spawn dfx deploy

expect "Please enter the passphrase for your identity:"
send "$passphrase\r"

interact

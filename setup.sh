#!/bin/bash
append_to_file() {
    local file="$1"
    local line="$2"
    grep -qF -- "$line" "$file" || echo "$line" | sudo tee -a "$file"
}

add_to_etc_hosts() {
    local host="$1"
    append_to_file "/etc/hosts" "127.0.0.1 ${host}"
}

gen_cert() {
    local val=${1:?Must provide host as arg}
    mkcert -cert-file "certs/$val.crt" -key-file "certs/$val.key" "$val"
}

gen_cert \*.nipsuli.dev
add_to_etc_hosts app.nipsuli.dev
add_to_etc_hosts auth.nipsuli.dev
add_to_etc_hosts gateway.nipsuli.dev


docker-compose run oathkeeper credentials generate --alg RS512 > oathkeeper-config/dev/jwks.json

#!/bin/sh
# Analytics on the VPS, idempotent (re-run after changing anything in tools/admin/ or tools/nginx-edugames.conf):
#   sh tools/admin/install.sh root@46.250.236.201
# -> beacon log /var/log/edugames/events.log (rotated weekly, kept 10 years, gzipped), stats.py every 10 min,
#    dashboard at https://edugames.altrabird.click/admin/ (user "admin"; the password is printed the first time only).
set -e
host=${1:?usage: sh tools/admin/install.sh user@host}
cd "$(dirname "$0")/../.."
tar -czf - tools/admin/index.html tools/admin/stats.py tools/nginx-edugames.conf | ssh "$host" 'set -e
  t=$(mktemp -d); tar -xzf - -C "$t"
  mkdir -p /var/log/edugames /var/www/edugames-admin /opt/edugames
  cp "$t/tools/admin/index.html" /var/www/edugames-admin/index.html
  cp "$t/tools/admin/stats.py" /opt/edugames/stats.py
  cp /etc/nginx/sites-available/edugames "/root/nginx-edugames-before-analytics.conf" 2>/dev/null || true
  cp "$t/tools/nginx-edugames.conf" /etc/nginx/sites-available/edugames
  if [ ! -f /etc/nginx/edugames-admin.htpasswd ]; then
    pw=$(openssl rand -base64 12 | tr -d "/+=" | cut -c1-12)
    printf "admin:%s\n" "$(openssl passwd -apr1 "$pw")" > /etc/nginx/edugames-admin.htpasswd
    chmod 640 /etc/nginx/edugames-admin.htpasswd; chgrp www-data /etc/nginx/edugames-admin.htpasswd
    echo "ADMIN LOGIN  user: admin  password: $pw   (save it; reset by deleting /etc/nginx/edugames-admin.htpasswd and re-running)"
  fi
  cat > /etc/logrotate.d/edugames-events <<R
/var/log/edugames/events.log {
  weekly
  rotate 520
  compress
  delaycompress
  missingok
  notifempty
  postrotate
    [ -f /run/nginx.pid ] && kill -USR1 \$(cat /run/nginx.pid)
  endscript
}
R
  echo "*/10 * * * * root python3 /opt/edugames/stats.py /var/log/edugames /var/www/edugames-admin/stats.json /var/www/edugames/games.json" > /etc/cron.d/edugames-stats
  if nginx -t; then systemctl reload nginx; else cp /root/nginx-edugames-before-analytics.conf /etc/nginx/sites-available/edugames; echo "nginx -t failed: old config restored"; exit 1; fi
  python3 /opt/edugames/stats.py /var/log/edugames /var/www/edugames-admin/stats.json /var/www/edugames/games.json
  rm -rf "$t"; echo "analytics installed"'

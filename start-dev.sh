#!/bin/bash
# Start dev server as a detached daemon that survives shell exit
cd /home/z/my-project
pkill -9 -f "next dev" 2>/dev/null
pkill -9 -f "next-server" 2>/dev/null
sleep 1
# Use setsid to create new session, redirect all IO, fully detach.
# Use the local next binary directly so PATH is not an issue.
setsid bash -c '
  cd /home/z/my-project
  exec ./node_modules/.bin/next dev -p 3000
' </dev/null >dev.log 2>&1 &
echo $! > /tmp/dev.pid
disown
echo "Started dev server, PID: $!"

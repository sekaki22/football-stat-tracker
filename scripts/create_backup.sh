#! /usr/bin/bash

now=$(date -u +"%Y%m%d_%H%M%S")
cp ~/repos/football-stat-tracker/data/dev.db ~/repos/football-stat-tracker/.backups/db_$now.db

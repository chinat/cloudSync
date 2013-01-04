#!/bin/bash
AppPath="/usr/share/applications/"
LIST=apps_sys.list

test -f $LIST && rm -f $LIST
for app in `cat apps_all.list`
do
    test -f ${AppPath}${app}".desktop" || rpm -q ${app} > /dev/null && echo "<div class='app unsync'><img src='img/apps/"${app}".png' alt="${app}"><h6 class='name'>"${app}"</h6></div>" >> $LIST
done

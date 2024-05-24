#! /usr/bin/bash
regex='^( *)'
declare -A lengths
while IFS='' read -r p; do
	line=$(printf "%s\n" "$p")
	[[ $line =~ $regex ]]
	lengths["${#BASH_REMATCH[1]}"]="$p" 
done < runlog.txt
regex='^ *(.*)'
for i in "${!lengths[@]}"
do
	[[ ${lengths[$i]} =~ $regex ]]
	lengths[$i]="${BASH_REMATCH[1]}"
	echo "${lengths[$i]}"
done

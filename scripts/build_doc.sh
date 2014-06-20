#!/bin/sh

GIT_DIR=$1
GIT_SHA=$2
LOG_OUTPUT_FILE=$3
DOCUMENTATION_OUTPUT_DIR=$4

echo "generating build..."
cd $GIT_DIR >> $LOG_OUTPUT_FILE 2>&1 || exit $?
git fetch origin >> $LOG_OUTPUT_FILE 2>&1 || exit $?
git checkout $GIT_SHA >> $LOG_OUTPUT_FILE 2>&1 || exit $?
doxygen >> $LOG_OUTPUT_FILE 2>&1 || exit $?
mv build/doxygen/html $DOCUMENTATION_OUTPUT_DIR >> $LOG_OUTPUT_FILE 2>&1 \
  || exit $?
rm -rf build/doxygen
echo "done."


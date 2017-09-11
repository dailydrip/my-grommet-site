#!/bin/sh

gatsby build &&
surge public/ pwa.dailydrip.com

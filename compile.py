#!/usr/bin/python3
# This script compiles the js using the closuer-compiler API
# https://closure-compiler.appspot.com

import http.client, urllib.parse, sys, re

api = "closure-compiler.appspot.com"
route = "/compile"

source_file = open("./src/cookieyesno.js")

code = source_file.read()
source_file.close()

# remove module.exports = CookieYesNo;
code = code.replace('module.exports = CookieYesNo;', '')

params = urllib.parse.urlencode([
    ("js_code", code),
    ("compilation_level", "SIMPLE_OPTIMIZATIONS"),
    ("output_format", "text"),
    ("output_info", "compiled_code"),
])

connection = http.client.HTTPSConnection(api)
connection.request("POST", route, params, { "Content-type": "application/x-www-form-urlencoded" })
response = connection.getresponse()
compiled = response.read()
connection.close()

# write bytes
dist_file = open("./dist/cookieyesno.min.js", "wb+")
dist_file.write(compiled)
dist_file.close()

print("Finished compiling")

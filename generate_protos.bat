@echo off
setlocal enabledelayedexpansion

set PROTO_DIR=./protos
set OUTPUT_DIR=./protoTs

for %%i in (%PROTO_DIR%\*.proto) do (
    set FILENAME=%%~ni
    protoc --plugin=protoc-gen-ts_proto=./node_modules/.bin/protoc-gen-ts_proto.cmd ^
    --ts_proto_out=%OUTPUT_DIR% ^
    --ts_proto_opt=outputServices=grpc-js,env=node,useOptionals=true,esModuleInterop=true ^
    --proto_path=%PROTO_DIR% ^
    %%~i
)
endlocal
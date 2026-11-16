#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p build public
CLANG="${CLANG:-/usr/bin/clang++}"
WASM_LD="${WASM_LD:-$(command -v wasm-ld || true)}"
if [ -z "$WASM_LD" ] && [ -x /opt/homebrew/opt/lld/bin/wasm-ld ]; then
  WASM_LD=/opt/homebrew/opt/lld/bin/wasm-ld
fi
if [ -z "$WASM_LD" ]; then
  echo "wasm-ld not found. Install LLVM/lld or set WASM_LD." >&2
  exit 1
fi
"$CLANG" --target=wasm32 -O3 -nostdlib -fno-exceptions -fno-rtti -fvisibility=hidden \
  -c engine/mech_core.cpp -o build/mech_core.o
"$WASM_LD" --no-entry --export=pose_ptr --export=ik_ptr --export=step_physics \
  --export=apply_impulse --export=reset_physics --export=two_bone_ik \
  --export-memory --initial-memory=131072 --max-memory=131072 --stack-first \
  -o public/mech-core.wasm build/mech_core.o
ls -lh public/mech-core.wasm

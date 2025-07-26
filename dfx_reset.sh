#!/bin/bash

# ================================================
# DFX RESET SCRIPT - by ChatGPT
# Uninstall DFX, reinstall stable version (0.27.0),
# and run dfx start + deploy
# ================================================

DFX_VERSION="0.27.0"

echo "🔧 Menghapus instalasi DFX lama..."

rm -rf ~/.cache/dfinity
rm -rf ~/.config/dfx
rm -rf ~/.local/share/dfx
rm -f ~/.local/bin/dfx

echo "✅ Uninstall selesai."

echo "⬇️ Mengunduh dan menginstal DFX versi $DFX_VERSION..."
sh -ci "$(curl -fsSL https://sdk.dfinity.org/install.sh)" <<< $DFX_VERSION

# Tambahkan dfx ke PATH jika belum ada
export PATH="$HOME/.local/bin:$PATH"

echo "🔎 Mengecek versi DFX..."
dfx --version

echo "🚀 Memulai local replica..."
dfx start --background

echo "🛠️ Deploy project..."
dfx deploy

echo "🎉 Selesai. DFX v$DFX_VERSION berhasil diinstal dan project dideploy."

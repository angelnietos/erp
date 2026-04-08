#!/bin/bash

# 🚀 Quick Setup Script for Ollama
# Run this to get started with free AI models

echo "🤖 Setting up Ollama for Free AI..."

# Check if Ollama is installed
if ! command -v ollama &> /dev/null; then
    echo "❌ Ollama not found. Installing..."

    # macOS
    if [[ "$OSTYPE" == "darwin"* ]]; then
        if command -v brew &> /dev/null; then
            brew install ollama
        else
            echo "❌ Homebrew not found. Install from: https://brew.sh/"
            exit 1
        fi

    # Linux
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        curl -fsSL https://ollama.ai/install.sh | sh

    # Windows (WSL)
    else
        echo "❌ Windows detected. Download Ollama from: https://ollama.ai/download"
        echo "   Then run this script in WSL."
        exit 1
    fi
fi

echo "✅ Ollama installed!"

# Start Ollama service in background
echo "🚀 Starting Ollama service..."
ollama serve &
sleep 2

# Pull a good general-purpose model
echo "📥 Downloading Llama 2 model (this may take a few minutes)..."
ollama pull llama2

echo ""
echo "🎉 Setup complete! Ollama is ready."
echo ""
echo "Next steps:"
echo "1. Open your app"
echo "2. Talk to any bot: 'configure ollama with url http://localhost:11434 and model llama2'"
echo "3. Say: 'switch to free provider ollama'"
echo "4. Enjoy unlimited AI conversations! 🤖✨"
echo ""
echo "To stop Ollama: killall ollama"
echo "To restart: ollama serve"</content>
<parameter name="filePath">setup-ollama.sh
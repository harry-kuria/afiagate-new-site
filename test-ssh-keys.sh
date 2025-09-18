#!/bin/bash

# Test all SSH keys with the server
SERVER_IP="98.86.62.135"
USERNAME="ubuntu"

echo "🔍 Testing SSH connection to $SERVER_IP..."

# Test each SSH key
for key in ~/.ssh/*.pem ~/.ssh/*_key ~/.ssh/id_*; do
    if [ -f "$key" ] && [ -r "$key" ]; then
        echo "Testing key: $key"
        ssh -i "$key" -o StrictHostKeyChecking=no -o ConnectTimeout=10 -o BatchMode=yes "$USERNAME@$SERVER_IP" "echo 'SSH successful with $key'" 2>/dev/null
        if [ $? -eq 0 ]; then
            echo "✅ SUCCESS with key: $key"
            echo "Use this command to connect:"
            echo "ssh -i $key $USERNAME@$SERVER_IP"
            exit 0
        else
            echo "❌ Failed with key: $key"
        fi
    fi
done

echo "❌ No SSH keys worked. Please check:"
echo "1. Instance is running"
echo "2. Security group allows SSH (port 22)"
echo "3. Correct IP address"
echo "4. SSH keys are associated with the instance"


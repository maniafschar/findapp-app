#!/bin/bash
if grep -q aps-environment platforms/ios/findapp/Resources/findapp.entitlements; then
  echo "Push notification entitlement already exists."
else
  echo "Push notification entitlement added."
  sed -i '' '/^[[:space:]]*<dict>/a\'$'\n''\'$'\t''<key>aps-environment<\/key>\'$'\n''\'$'\t''<string>production<\/string>\'$'\n''' platforms/ios/findapp/Resources/findapp.entitlements
  sed -i '' '/^[[:space:]]*<dict>/a\'$'\n''\'$'\t''<key>com.apple.developer.applesignin<\/key>\'$'\n''\'$'\t''<array><string>Default</string></array>\'$'\n''' platforms/ios/findapp/Resources/findapp.entitlements
fi
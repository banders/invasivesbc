sudo xcodebuild -allowProvisioningUpdates -workspace ios/App/App.xcworkspace -scheme App -configuration Release clean archive -archivePath buildArchive/App.xcarchive CODE_SIGN_IDENTITY="River Guardian" CODE_SIGNING_REQUIRED=NO CODE_SIGNING_ALLOWED=NO


To run on android:
```
$ yarn install
$ react-native run-android --variant=ovrDebug
```

To run on ios:
```
$ yarn install
$ cd ios
$ pod install
$ cd ..
$ react-native run-ios
```

To run on device:
```
$ open ios/CameraApp.xcworkspace
```
select device in xcode and run

If you have issues compiling regarding dependencies or something, you can clean the build and then reinstall clean Pod files in the ios folder run:

```
$ rm -rf Podfile.lock Pods
$ pod install
```


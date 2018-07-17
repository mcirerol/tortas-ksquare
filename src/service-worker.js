/**
 * Check out https://googlechromelabs.github.io/sw-toolbox/ for
 * more info on how to use sw-toolbox to custom configure your service worker.
 */


'use strict';
importScripts('./build/sw-toolbox.js');
importScripts('https://www.gstatic.com/firebasejs/4.9.0/firebase.js')
importScripts('https://www.gstatic.com/firebasejs/4.9.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/4.9.0/firebase-messaging.js');

firebase.initializeApp({
  apiKey: "AIzaSyCacpE6Wdr2xbdcaVcplu4Lwldg1YWpfmY",
  authDomain: "tortas-dev.firebaseapp.com",
  databaseURL: "https://tortas-dev.firebaseio.com",
  projectId: "tortas-dev",
  storageBucket: "tortas-dev.appspot.com",
  messagingSenderId: "921279380601",
  certificatePair: "BPHPztwyR54UJvgcfX_XLYq3gP_Bq7Cno5kKdQlrWhjKHIVnu3qCTrYmQSqip-h6p0VYNkVdqUhbCupCC0F_XG8",
});

const messaging = firebase.messaging();

messaging.setBackgroundMessageHandler(function(payload) {
  console.log('Received background message ', payload);
  // here you can override some options describing what's in the message; 
  // however, the actual content will come from the Webtask
  const notificationOptions = {
    icon: '/assets/images/logo-128.png'
  };
  return self.registration.showNotification(notificationTitle, notificationOptions);
});

self.toolbox.options.cache = {
  name: 'ionic-cache'
};

// pre-cache our key assets
self.toolbox.precache(
  [
    './build/main.js',
    './build/vendor.js',
    './build/main.css',
    './build/polyfills.js',
    'index.html',
    'manifest.json'
  ]
);

// dynamically cache any other local assets
self.toolbox.router.any('/*', self.toolbox.fastest);

// for any other requests go to the network, cache,
// and then only use that cached resource if your user goes offline
self.toolbox.router.default = self.toolbox.networkFirst;

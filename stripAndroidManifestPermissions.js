#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const permissions = [
	'ACCESS_COARSE_LOCATION',
	'ACCESS_FINE_LOCATION',
	'ACCESS_BACKGROUND_LOCATION',
	'BLUETOOTH',
	'BLUETOOTH_ADMIN',
	'BLUETOOTH_SCAN',
	'BLUETOOTH_CONNECT',
	'CAMERA',
	'INTERNET',
	'INTERACT_ACROSS_USERS_FULL',
	'MODIFY_AUDIO_SETTINGS',
	'RECORD_AUDIO',
	'WAKE_LOCK',
	'READ_MEDIA_IMAGES',
	'READ_MEDIA_VIDEO',
	'WRITE_EXTERNAL_STORAGE'
];

// Helper script for repairing https://github.com/don/cordova-plugin-ble-central/issues/925
module.exports = function (context) {
	const { projectRoot } = context.opts;
	const platformPath = path.resolve(projectRoot, 'platforms/android');
	const manifestPath = path.resolve(platformPath, 'app/src/main/AndroidManifest.xml');
	if (!fs.existsSync(manifestPath))
		throw "Can't find AndroidManifest.xml in platforms/Android";

	let androidManifest = fs.readFileSync(manifestPath).toString();
	const duplicates = [];
	for (const permission of permissions) {
		const matcher = usesPermissionsRegex(permission);
		const matches = matchAll(matcher, androidManifest);
		// Skip the first match, only want duplicates
		duplicates.push(...matches.slice(1));
	}

	if (duplicates.length > 0) {
		duplicates.sort((a, b) => b.index - a.index);
		for (const match of duplicates) {
			console.log('Deleting duplicate entry: ' + match[0].trim());
			androidManifest = androidManifest.substring(0, match.index) + androidManifest.substring(match.index + match[0].length);
		}
		fs.writeFileSync(manifestPath, androidManifest);
	}
	const toolsAttribute = "xmlns:tools=\"http://schemas.android.com/tools\"";
	const manifestOpen = "<manifest";

	const manifestPath2 = path.join(context.opts.projectRoot, 'platforms/android/app/src/main/AndroidManifest.xml');
	let manifest = fs.readFileSync(manifestPath2).toString();

	if (manifest.indexOf(toolsAttribute) == -1) {
		manifest = manifest.replace(manifestOpen, manifestOpen + " " + toolsAttribute + " ");
		fs.writeFileSync(manifestPath2, manifest, 'utf8');
	}
};

function usesPermissionsRegex(permission) {
	return new RegExp(
		'\\n\\s*?<uses-permission.*? android:name="android\\.permission\\.' + permission + '".*?\\/>',
		'gm'
	);
}

function matchAll(regex, value) {
	let capture = [];
	const all = [];
	while ((capture = regex.exec(value)) !== null) all.push(capture);
	return all;
}
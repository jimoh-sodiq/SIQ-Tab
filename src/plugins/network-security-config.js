// Source - https://stackoverflow.com/a/70775576
// Posted by silentsurfer
// Retrieved 2025-11-28, License - CC BY-SA 4.0

const {AndroidConfig, withAndroidManifest } = require('@expo/config-plugins');
const {Paths} = require('@expo/config-plugins/build/android');
const path = require('path');
const fs = require('fs');
const fsPromises = fs.promises;

const { getMainApplicationOrThrow} = AndroidConfig.Manifest

const withTrustLocalCerts = config => {
    return withAndroidManifest(config, async config => {
        config.modResults = await setCustomConfigAsync(config, config.modResults);
        return config;
    });
}

async function setCustomConfigAsync(
    config,
    androidManifest
) {

    const src_file_pat = path.join(__dirname, "network_security_config.xml");
    console.log('src_file_pat', src_file_pat)
    const res_file_path = path.join(await Paths.getResourceFolderAsync(config.modRequest.projectRoot),
        "xml", "network_security_config.xml");
        console.log('res_file_path', res_file_path)

    const res_dir = path.resolve(res_file_path, "..");

    if (!fs.existsSync(res_dir)) {
        await fsPromises.mkdir(res_dir);
    }

    try {
        await fsPromises.copyFile(src_file_pat, res_file_path);
    } catch (e) {
        throw e;
    }

    const mainApplication = getMainApplicationOrThrow(androidManifest);
    mainApplication.$["android:networkSecurityConfig"] = "@xml/network_security_config";

    return androidManifest;
}

module.exports = withTrustLocalCerts;

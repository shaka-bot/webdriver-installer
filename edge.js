/*! @license
 * WebDriver Installer
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

const {WebDriverInstallerBase} = require('./base.js');
const {InstallerUtils} = require('./utils.js');

const os = require('os');
const path = require('path');

const CDN_URL = 'https://msedgedriver.azureedge.net/';

/**
 * An installer for msedgedriver for desktop Edge.
 */
class EdgeWebDriverInstaller extends WebDriverInstallerBase {
  /** @return {string} */
  getBrowserName() {
    return 'Edge';
  }

  /** @return {string} */
  getDriverName() {
    return 'msedgedriver';
  }

  /** @return {!Promise<?string>} */
  async getInstalledBrowserVersion() {
    if (os.platform() == 'linux') {
      const output = await InstallerUtils.getCommandOutputOrNullIfMissing(
          ['microsoft-edge', '--version']);
      // Output is a string like "Microsoft Edge 97.0.1072.76\n"
      return output ? output.trim().split(' ')[2] : null;
    } else if (os.platform() == 'darwin') {
      return await InstallerUtils.getMacAppVersion('Microsoft Edge');
    } else if (os.platform() == 'win32') {
      return await InstallerUtils.getWindowsExeVersion('msedge.exe');
    } else {
      throw new Error(`Unrecognized platform: ${os.platform()}`);
    }
  }

  /**
   * @param {string} outputDirectory
   * @return {!Promise<?string>}
   */
  async getInstalledDriverVersion(outputDirectory) {
    // NOTE: Using path.join here would also normalize the path, which would
    // turn something like "./msedgedriver" into "msedgedriver", which would
    // fail to execute.
    const outputPath = outputDirectory + path.sep + this.getDriverName();

    const output = await InstallerUtils.getCommandOutputOrNullIfMissing(
        [outputPath, '--version']);
    // Output is a string like "MSEdgeDriver 96.0.1054.62 (sha1)\n"
    return output ? output.trim().split(' ')[1] : null;
  }

  /**
   * @param {string} browserVersion
   * @return {!Promise<string>}
   */
  async getBestDriverVersion(browserVersion) {
    const majorVersion = browserVersion.split('.')[0];
    const versionUrl = `${CDN_URL}/LATEST_RELEASE_${majorVersion}`;
    return await InstallerUtils.fetchVersionUrl(versionUrl, 'UTF-16LE');
  }

  /**
   * @param {string} driverVersion
   * @param {string} outputDirectory
   * @param {string=} outputName
   * @return {!Promise}
   */
  async install(driverVersion, outputDirectory) {
    let platform;

    if (os.platform() == 'linux') {
      platform = 'linux64';
    } else if (os.platform() == 'darwin') {
      platform = 'mac64';
    } else if (os.platform() == 'win32') {
      platform = 'win64';
    } else {
      throw new Error(`Unrecognized platform: ${os.platform()}`);
    }

    const archiveUrl = `${CDN_URL}/${driverVersion}/edgedriver_${platform}.zip`;

    let binaryName = 'msedgedriver';
    if (os.platform() == 'win32') {
      binaryName += '.exe';
    }

    let outputName = this.getDriverName();
    if (os.platform() == 'win32') {
      outputName += '.exe';
    }

    return await InstallerUtils.installBinary(
        archiveUrl, binaryName, outputName,
        outputDirectory, /* isZip= */ true);
  }
}

module.exports = {EdgeWebDriverInstaller};

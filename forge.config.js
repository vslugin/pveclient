module.exports = {
    packagerConfig: {
        asar: true,
    },
    rebuildConfig: {},
    makers: [
        {
            name: '@electron-forge/maker-deb',
            config: {
                options: {
                    description: "PVE Client",
                    maintainer: 'V. Slugin',
                    homepage: 'https://github.com/vslugin/pveclient'
                }
            }
        },
        {
            name: '@electron-forge/maker-squirrel',
            config: {
                authors: 'V. Slugin',
                description: 'PVE Client'
            }
        }
    ],
    plugins: [
        {
            name: '@electron-forge/plugin-auto-unpack-natives',
            config: {},
        },
    ],
};

// If any given tab on the spreadsheet does not have an entry here, todo will not run properly
//      If you want to ignore a certain tab, add its **exact name** to the excludedTabs list here
//      Otherwise it should have an entry in subteamData

const subteamData = {
    '2023 Car': {
        color: 0xE74C3C, // red
        thread: '1194729226335690862', //1194729226335690862
    },
    '2021 Car': {
        color: 0xE74C3C, // red
        thread: '1194729250591342642', //1194729250591342642
    },
    'Chassis': {
        color: 0x71368A, // purple
        thread: '1196997142246588457', //1196997142246588457
    },
    'Controls': {
        color: 0x1ABC9C, // turquoise
        thread: '1196997834566799420', //1196997834566799420
    },
    'Drivetrain': {
        color: 0xF1C40F, // yellow
        thread: '', //1196998022211584141
    },
    'Suspension': {
        color: 0x2ECC71, // green
        thread: '1196998067539427338', //1196998067539427338
    },
    'DAQ': {
        color: 0x3498DB, // blue
        thread: '1196507080903893043', //1192706895614582885
    },
};

const excludedTabs = ['Message IDs'];

module.exports = {
    subteamData,
    excludedTabs,
};

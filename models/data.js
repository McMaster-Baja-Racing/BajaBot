// If any given tab on the spreadsheet does not have an entry here, todo will not run properly
//      If you want to ignore a certain tab, add its **exact name** to the excludedTabs list here
//      Otherwise it should have an entry in subteamData

const subteamData = {
    '2023 Car': {
        color: 0xE74C3C, // red
        thread: '1192706895614582885', //1194729696731078737
    },
    '2021 Car': {
        color: 0xE74C3C, // red
        thread: '1192706895614582885', //1194729778146709674
    },
    'Chassis': {
        color: 0x71368A, // purple
        thread: '1192706895614582885', //1192481865056137247
    },
    'Controls': {
        color: 0x1ABC9C, // turquoise
        thread: '1192706895614582885', //1192508568927219773
    },
    'Drivetrain': {
        color: 0xF1C40F, // yellow
        thread: '1192706895614582885', //1192666172664053891
    },
    'Suspension': {
        color: 0x2ECC71, // green
        thread: '1192706895614582885', //1192708198881308772
    },
    'DAQ': {
        color: 0x3498DB, // blue
        thread: '1192706895614582885', //1192706895614582885
    },
};

const excludedTabs = ['Message IDs'];

module.exports = {
    subteamData,
    excludedTabs,
};

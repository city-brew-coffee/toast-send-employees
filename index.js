const toast = require('toast-api-wrapper');
const admin = require('firebase-admin');
const functions = require('firebase-functions');

admin.initializeApp(functions.config().firebase);

const db = admin.firestore()

exports.sendEmployees = async (pubSubEvent, context) => {
    const token = await getAuthToken();

    const emps = await toast.getAllEmployees(accessToken=token, managementGroupGuid=process.env.toast_restaurant_group_guid, restaurantGuid=process.env.toast_restaurant_guid);

    const newEmp = {
        'firstName': 'Tester',
        'lastName': 'McTesterson',
        'email': 'marcusqa@email.ghostinspector.com',
        'passcode': '5832',
        'externalEmployeeId': '44532'
    };

    const response = await toast.addEmployee(accessToken=token, restaurantGuid=process.env.toast_restaurant_guid, employee=newEmp);

    console.log(emps);
    console.log(response);

    return emps;
}

async function getAuthToken() {
    const snap = await db.doc('meta/toast').get();
    const data = snap.data();

    if (data) {
        if (Date.now() > (data.expires_at * 1000)) {
            

            // current auth code expired
            const response = await requestNewToken();
            return response.access_token;
        } else {
            return data.access_token;
        }
    } else {
        const response = await requestNewToken();
        return response.access_token;
    }
}
async function requestNewToken() {
    const response = await toast.requestNewToken();

    const writeData = {
        'access_token': response.access_token,
        'rsGuid': response.rsGuid,
        'expires_in': response.expires_in - process.env.expires_in_offset,
        'expires_at': Math.floor((Date.now() + ((response.expires_in - process.env.expires_in_offset) * 1000) / 1000))
    };

    await db.doc('meta/toast').set(writeData);
    return response;
}
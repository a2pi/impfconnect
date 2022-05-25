export const EPR_SPID_OID = 'urn:oid:2.16.756.5.30.1.127.3.10.3';
export const HOEHEWEG_OID = 'urn:oid:2.16.756.5.30.1.178.1.1';
export const EPD_PLAYGROUND_OID = 'urn:oid:1.1.1.99.1';
export const CURRENT_DOCUMENT = '/fhir/DocumentReference?status=current&patient.identifier=urn:oid:1.1.1.99.1';

/*
* Get a patients ID for a given system, defined by the systems OID.
* @param system     - the OID of the system you want to get the ID from
* @param patient    - the Patient resource
* @returns           - the ID as a string, if found
*                   - '-' if no matching system is found
*/
export function getIdBySystemOID(system: any, patient: { identifier: any[]; }) {
    const identifier = patient.identifier.find(identifier => identifier.system == system);
    return identifier
                ? identifier.value
                : '-';
}

/*
* Converts a file to the Base64 format, which is necessary
* or uploading it to the EPD playground
* @param file       - the file to convert
* @returns           - a Promise that resolves to a String with the file encoded
*                     in Base64 or rejects if conversion does not work.
*/
export function convertToBase64(file: Blob) {
    return new Promise((resolve, reject) => {
        if (file) {
            // FileReader function for read the file.
            const fileReader = new FileReader();
            // Onload of file read the file content
            fileReader.onload = (e => {
                const input = e.target.result;
                if ((<string>input).indexOf(';base64,') > -1) {
                    return resolve((<string>input).split(';base64,')[1]);
                } else {
                    return resolve(btoa(e.target.result  as string));
                }
            });
            // Convert data to base64
            fileReader.readAsDataURL(file);
        }
        else {
            return reject('No file.');
        }
    });
}


/*
* Checks if a http server is responding or not.
* Based on: https://stackoverflow.com/questions/4282151/is-it-possible-to-ping-a-server-from-javascript
* @param server     - the url of the server to check
* @param timeout    - milliseconds to wait for the server to respond
* @returns          - A promise that resolves to true if the server responds
*                     within the given timeout timespan (even with an error
*                     message), and resolves to false, if the server does not respond (timeout).
*                     The promise is rejected when the server param is not a valid url.
*/
export function checkAvailability(server: string, timeout: number) {
    return new Promise((resolve, reject) => {
        // validate correct url
        try {
            if (!new URL(server).protocol.includes('http')) {
                return reject('\"' + server + '\" is not a valid URL.');
            }
        } catch (e) {
            console.log(e);
            return reject('"' + server + '" is not a valid URL.');
        }

        // if the url is fine, let's ping
        const ping = new Image();
        ping.onload = () => resolve(true);
        // an error is also a response, so: resolve
        ping.onerror = () => resolve(true);

        ping.src = server;
        // set timeout so were not stuck trying forever
        setTimeout(() => resolve(false), timeout);
    });
}

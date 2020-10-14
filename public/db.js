const { get } = require("mongoose");

let db;
const request = indexedDB.open("budget", 1);

request.onupgradeneeded = event => {
    const db = event.target.result;
    db.createObjectStore("pending", { autoIncrement: true});
}

request.onsuccess = event => {
    db = event.target.result;

    // make sure app is online before using database
    if(navigator.onLine) {
        checkDatabase();
    }
};

request.onError = event => {
    console.log(event.target.errorCode);
}

saveRecord(record) => {
    const transaction = db.transaction(["pending"], "readwrite");
    const store = transaction.ObjectStore("pending");
    const getAll = store.getAll();

    getAll.onsuccess = () => {
        if(getAll.result.length > 0) {
            fetch("/api/transaction/bulk", {
                method: "POST",
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: "application/json, text/plain, */*",
                    "Content-Type": "application/json"
                }
            })
            .then(response => response.json())
            .then(() => {
                // delete records if successful
                const transaction = db.transaction(["pending"], "readwrite");
                const store = transaction.ObjectStore("pending");
                store.clear();
            })
        }
    }
}

deletePending() => {
    const transaction = db.transaction(["pending"], "readwrite");
    const store = transaction.ObjectStore("pending");
    store.clear();
}

// listen for app coming online
window.addEventListener("online", checkDatabase)